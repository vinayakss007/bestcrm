
import { Injectable, Inject, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from '../auth/dto/register.dto';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';

// This is a real user type inferred from your Drizzle schema.
export type User = typeof schema.crmUsers.$inferSelect;
type Role = typeof schema.crmRoles.$inferSelect;

export type AuthenticatedUser = {
    userId: number;
    email: string;
    organizationId: number;
    role: Role & { permissions: { permission: { key: string } }[] };
}


@Injectable()
export class UsersService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async findOneById(id: number): Promise<User | undefined> {
    const users = await this.db.query.crmUsers.findMany({
        where: eq(schema.crmUsers.id, id),
        with: {
            role: {
                with: {
                    permissions: {
                        with: {
                            permission: true,
                        }
                    }
                }
            },
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
          role: {
            with: {
                permissions: {
                    with: {
                        permission: true,
                    }
                }
            }
        },
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
        
        if (!anyOrg) {
            // First time setup: create a Super Admin's Organization and the role
            console.log('First run detected, creating Super Admin and system roles...');
            const [superAdminOrg] = await tx.insert(schema.organizations).values({ name: "Super Admin Workspace" }).returning();
            const [superAdminRole] = await tx.insert(schema.crmRoles).values({ name: "super-admin", isSystemRole: true }).returning();

            // Create the Super Admin user
            const superAdminPasswordHash = await bcrypt.hash(this.configService.get<string>('superAdmin.password'), saltRounds);
            await tx.insert(schema.crmUsers).values({
                email: 'super@admin.com',
                name: 'Super Admin',
                passwordHash: superAdminPasswordHash,
                organizationId: superAdminOrg.id,
                roleId: superAdminRole.id,
            });
            console.log('Super Admin user created.');
        }

        // --- Create the actual user who signed up ---

        // For every new self-service sign-up, always create a new organization.
        const [newOrg] = await tx.insert(schema.organizations).values({ name: `${registerDto.name}'s Organization` }).returning();
        const organizationId = newOrg.id;

        // Create the default 'company-admin' and 'user' roles for the new organization
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

        const [newUser] = await tx.insert(schema.crmUsers).values(newUserInsert).returning();
        return newUser;
    });
  }

  async invite(inviteUserDto: InviteUserDto, invitingUser: AuthenticatedUser): Promise<Omit<User, 'passwordHash' | 'isDeleted' | 'deletedAt'>> {
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

    const [newUser] = await this.db.insert(schema.crmUsers).values({
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

    return newUser;
  }


  async update(id: number, updateUserDto: UpdateUserDto, organizationId: number): Promise<Omit<User, 'passwordHash' | 'isDeleted' | 'deletedAt'>> {
    // findOneById doesn't scope by organization, so we need to add that check.
    const userToUpdate = await this.findOneById(id);
    if (!userToUpdate || userToUpdate.organizationId !== organizationId) {
        throw new NotFoundException('User not found.');
    }
    
    const [updatedUser] = await this.db
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

    return updatedUser;
  }

  async impersonate(userId: number, requestingUser: AuthenticatedUser) {
    // This action is already protected by the PermissionsGuard, so we know the requester is a super-admin.
    const targetUser = await this.findOneById(userId);

    if (!targetUser) {
      throw new NotFoundException('Target user not found.');
    }
    
    // We fetch the full role with permissions for the token payload
    const userWithRole = await this.db.query.crmUsers.findFirst({
      where: eq(schema.crmUsers.id, userId),
      with: {
        role: {
          with: {
            permissions: {
              with: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!userWithRole) {
         throw new NotFoundException('Target user not found.');
    }

    const payload = {
      sub: userWithRole.id,
      email: userWithRole.email,
      organizationId: userWithRole.organizationId,
      role: userWithRole.role,
      isImpersonating: true,
      originalUserId: requestingUser.userId,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
