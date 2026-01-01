
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';

import { DrizzleProvider } from '../drizzle/drizzle.provider';
import * as schema from '@/db/schema';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(createAccountDto: CreateAccountDto, organizationId: number) {
    const newAccount = await this.db
      .insert(schema.crmAccounts)
      .values({
        ...createAccountDto,
        organizationId, // Ensure account is tied to the user's organization
      })
      .returning();
    return newAccount[0];
  }

  async findAll(organizationId: number) {
    return await this.db
      .select()
      .from(schema.crmAccounts)
      .where(
        and(
          eq(schema.crmAccounts.organizationId, organizationId),
          eq(schema.crmAccounts.isDeleted, false), // Exclude soft-deleted accounts
        ),
      );
  }

  async findOne(id: number, organizationId: number) {
    const account = await this.db
      .select()
      .from(schema.crmAccounts)
      .where(
        and(
          eq(schema.crmAccounts.id, id),
          eq(schema.crmAccounts.organizationId, organizationId), // Security check
          eq(schema.crmAccounts.isDeleted, false),
        ),
      );

    if (account.length === 0) {
      throw new NotFoundException('Account not found');
    }
    return account[0];
  }
}
