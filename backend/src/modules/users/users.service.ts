
import { Injectable, Inject, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcrypt';

import { RegisterDto } from '../auth/dto/register.dto';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';

// This is a real user type inferred from your Drizzle schema.
export type User = typeof schema.crmUsers.$inferSelect;
type Role = typeof schema.crmRoles.$inferSelect;

type AuthenticatedUser = {
    userId: number;
    email: string;
    organizationId: number;
    role: Role;
}


@Injectable()
export class UsersService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findOneById(id: number, organizationId: number): Promise<User | undefined> {
    const users = await this.db.query.crmUsers.findMany({
        where: and(eq(schema.crmUsers.id, id), eq(schema.crmUsers.organizationId, organizationId)),
        with: {
            role: true,
        }
    });
    return users[0];
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const users = await this.db.query.crmUsers.findMany({
      where: and(
          eq(schema.crmUsers.email, email),
          eq(schema.crmUsers.isDeleted, false) // Ensure only active users can be found
      ),
      with: {
          role: true,
      }
    });
    return users[0];
  }

  async findAll(requestingUser: AuthenticatedUser) {
    if (requestingUser.role.name === 'super-admin') {
        // Super admin can see all users from all organizations
        return await this.db.query.crmUsers.findMany({
            where: eq(schema.crmUsers.isDeleted, false),
            columns: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
                organizationId: true,
                roleId: true,
            },
            with: {
                organization: {
                    columns: {
                        name: true,
                    }
                },
                role: {
                  columns: {
                    name: true,
                  }
                }
            },
            orderBy: (users, { asc }) => [asc(users.name)],
        });
    }

    // Regular users and company admins only see users in their own organization
    return await this.db.query.crmUsers.findMany({
      where: and(
          eq(schema.crmUsers.organizationId, requestingUser.organizationId),
          eq(schema.crmUsers.isDeleted, false)
      ),
      columns: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        organizationId: true,
        roleId: true,
      },
       with: {
          role: {
            columns: {
              name: true,
            }
          }
       },
      orderBy: (users, { asc }) => [asc(users.name)],
    });
  }

  async create(registerDto: RegisterDto): Promise<User> {
    return this.db.transaction(async (tx) => {
        const existingUser = await tx.query.crmUsers.findFirst({
            where: eq(schema.crmUsers.email, registerDto.email),
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }
        
        const saltRounds = 10;
        
        // Check if it's the very first user in the system
        const anyOrg = await tx.query.organizations.findFirst();
        
        let superAdminRoleId: number;
        if (!anyOrg) {
            // First time setup: create a Super Admin's Organization
            const superAdminOrg = await tx.insert(schema.organizations).values({ name: "Super Admin Workspace" }).returning();
            const superAdminOrgId = superAdminOrg[0].id;

            // Create the global Super Admin role
            const superAdminRole = await tx.insert(schema.crmRoles).values({ name: "super-admin", isSystemRole: true }).returning();
            superAdminRoleId = superAdminRole[0].id;

            // Create the Super Admin user
            const superAdminPasswordHash = await bcrypt.hash('password123', saltRounds);
            await tx.insert(schema.crmUsers).values({
                email: 'super@admin.com',
                name: 'Super Admin',
                passwordHash: superAdminPasswordHash,
                organizationId: superAdminOrgId,
                roleId: superAdminRoleId,
            });
        }

        // --- Create the actual user who signed up ---

        // For every new self-service sign-up, always create a new organization.
        const newOrg = await tx.insert(schema.organizations).values({ name: `${registerDto.name}'s Organization` }).returning();
        const organizationId = newOrg[0].id;

        // Create the default 'Company Admin' and 'User' roles for the new organization
        const [companyAdminRole] = await tx.insert(schema.crmRoles).values({ name: "company-admin", organizationId, isSystemRole: true }).returning();
        await tx.insert(schema.crmRoles).values({ name: "user", organizationId, isSystemRole: true });

        // The first user of a new organization is always the company-admin.
        const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);
        const newUserInsert = {
            email: registerDto.email,
            name: registerDto.name,
            passwordHash,
            organizationId,
            roleId: companyAdminRole.id,
        };

        const newUsers = await tx.insert(schema.crmUsers).values(newUserInsert).returning();
        return newUsers[0];
    });
  }

  async invite(inviteUserDto: InviteUserDto, invitingUser: AuthenticatedUser): Promise<Omit<User, 'passwordHash' | 'isDeleted' | 'deletedAt'>> {
    if (invitingUser.role.name === 'user') {
      throw new ForbiddenException('Only admins can invite new users.');
    }

    const { email, name, password, roleName } = inviteUserDto;
    
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const role = await this.db.query.crmRoles.findFirst({
        where: and(
            eq(schema.crmRoles.name, roleName),
            eq(schema.crmRoles.organizationId, invitingUser.organizationId)
        ),
    });

    if (!role) {
        throw new NotFoundException(`Role '${roleName}' not found in your organization.`);
    }
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await this.db.insert(schema.crmUsers).values({
        email,
        name,
        passwordHash,
        roleId: role.id,
        organizationId: invitingUser.organizationId, // Assign to the inviter's organization
    }).returning({
        id: schema.crmUsers.id,
        name: schema.crmUsers.name,
        email: schema.crmUsers.email,
        avatarUrl: schema.crmUsers.avatarUrl,
        roleId: schema.crmUsers.roleId,
        createdAt: schema.crmUsers.createdAt,
        organizationId: schema.crmUsers.organizationId,
    });

    return newUser[0];
  }


  async update(id: number, updateUserDto: UpdateUserDto, organizationId: number): Promise<Omit<User, 'passwordHash' | 'isDeleted' | 'deletedAt'>> {
    const userToUpdate = await this.findOneById(id, organizationId);
    if (!userToUpdate) {
        throw new NotFoundException('User not found.');
    }
    
    // In a real RBAC system, you'd check if the requesting user has permission.
    // For now, we assume users can update their own info.
    // A check like `if (requestingUserId !== id && requestingUserRole !== 'admin')` would be here.

    const updatedUser = await this.db
        .update(schema.crmUsers)
        .set(updateUserDto)
        .where(eq(schema.crmUsers.id, id))
        .returning({
          id: schema.crmUsers.id,
          name: schema.crmUsers.name,
          email: schema.crmUsers.email,
          avatarUrl: schema.crmUsers.avatarUrl,
          roleId: schema.crmUsers.roleId,
          createdAt: schema.crmUsers.createdAt,
          organizationId: schema.crmUsers.organizationId,
        });

    return updatedUser[0];
  }
}

      