
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

  async findAll(organizationId: number) {
    return await this.db.query.crmUsers.findMany({
      where: eq(schema.crmUsers.organizationId, organizationId),
      columns: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
      orderBy: (users, { asc }) => [asc(users.name)],
    });
  }

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // In a real application, you'd have a more robust way to handle this,
    // like checking if any other organization exists.
    const allOrgs = await this.db.select().from(schema.organizations).limit(1);
    let organizationId: number;
    let userRole: 'company-admin' | 'user' | 'super-admin' = 'user';

    if (allOrgs.length === 0) {
      // First user ever, create a new organization and make them the admin.
      const newOrg = await this.db
        .insert(schema.organizations)
        .values({ name: `${registerDto.name}'s Organization` })
        .returning();
      organizationId = newOrg[0].id;
      userRole = 'company-admin';
    } else {
      // For simplicity, subsequent users join the first organization.
      // A real app would use an invite system.
      organizationId = allOrgs[0].id;
    }

    const newUserInsert = {
      email: registerDto.email,
      name: registerDto.name,
      passwordHash,
      organizationId,
      role: userRole,
    };

    const newUsers = await this.db
      .insert(schema.crmUsers)
      .values(newUserInsert)
      .returning();
    
    return newUsers[0];
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
