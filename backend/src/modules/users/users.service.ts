
import { Injectable, Inject, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcrypt';

import { RegisterDto } from '../auth/dto/register.dto';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { UpdateUserDto } from './dto/update-user.dto';

// This is a real user type inferred from your Drizzle schema.
export type User = typeof schema.crmUsers.$inferSelect;
type AuthenticatedUser = {
    userId: number;
    email: string;
    organizationId: number;
    role: 'user' | 'company-admin' | 'super-admin';
}


@Injectable()
export class UsersService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findOneById(id: number, organizationId: number): Promise<User | undefined> {
    const users = await this.db
        .select()
        .from(schema.crmUsers)
        .where(and(eq(schema.crmUsers.id, id), eq(schema.crmUsers.organizationId, organizationId)));
    return users[0];
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const users = await this.db
      .select()
      .from(schema.crmUsers)
      .where(eq(schema.crmUsers.email, email));
    return users[0];
  }

  async findAll(requestingUser: AuthenticatedUser) {
    if (requestingUser.role === 'super-admin') {
        // Super admin can see all users from all organizations
        return await this.db.query.crmUsers.findMany({
            columns: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
                organizationId: true,
            },
            with: {
                organization: {
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
      where: eq(schema.crmUsers.organizationId, requestingUser.organizationId),
      columns: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        organizationId: true,
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
        const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

        // For a new self-service sign-up, always create a new organization.
        const newOrg = await tx
            .insert(schema.organizations)
            .values({ name: `${registerDto.name}'s Organization` })
            .returning();
        
        const organizationId = newOrg[0].id;
        // The first user of an organization is always the company-admin.
        const userRole: 'company-admin' = 'company-admin';

        const newUserInsert = {
            email: registerDto.email,
            name: registerDto.name,
            passwordHash,
            organizationId,
            role: userRole,
        };

        const newUsers = await tx
            .insert(schema.crmUsers)
            .values(newUserInsert)
            .returning();
        
        return newUsers[0];
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto, organizationId: number): Promise<Omit<User, 'passwordHash'>> {
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
          role: schema.crmUsers.role,
          createdAt: schema.crmUsers.createdAt,
          organizationId: schema.crmUsers.organizationId,
        });

    return updatedUser[0];
  }
}

    