
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, or, ilike } from 'drizzle-orm';
import { stringify } from 'csv-stringify/sync';

import { DrizzleProvider } from '../drizzle/drizzle.provider';
import * as schema from '@/db/schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(createAccountDto: CreateAccountDto, organizationId: number, userId: number) {
    return await this.db.transaction(async (tx) => {
        const newAccount = await tx
        .insert(schema.crmAccounts)
        .values({
            ...createAccountDto,
            organizationId, // Ensure account is tied to the user's organization
        })
        .returning();

        const account = newAccount[0];

        // Log this action in the activity feed
        await tx.insert(schema.crmActivities).values({
            type: 'account_created',
            details: { name: account.name },
            userId,
            organizationId,
            relatedToType: 'Account',
            relatedToId: account.id,
        });

        return account;
    });
  }

  async findAll(organizationId: number, query?: string) {
    const conditions = [
        eq(schema.crmAccounts.organizationId, organizationId),
        eq(schema.crmAccounts.isDeleted, false),
    ];

    if (query) {
        conditions.push(
            or(
                ilike(schema.crmAccounts.name, `%${query}%`),
                ilike(schema.crmAccounts.industry, `%${query}%`)
            )
        )
    }

    return await this.db.query.crmAccounts.findMany({
        where: and(...conditions),
        with: {
            owner: {
                columns: {
                    name: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: (accounts, { asc }) => [asc(accounts.name)],
    });
  }

  async findOne(id: number, organizationId: number) {
    const account = await this.db.query.crmAccounts.findFirst({
        where:
        and(
          eq(schema.crmAccounts.id, id),
          eq(schema.crmAccounts.organizationId, organizationId), // Security check
          eq(schema.crmAccounts.isDeleted, false),
        ),
        with: {
            owner: {
                columns: {
                    name: true,
                    avatarUrl: true
                }
            }
        }
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
    organizationId: number,
  ) {
    // First, verify the account exists and belongs to the user's organization
    await this.findOne(id, organizationId);

    const updatedAccount = await this.db
      .update(schema.crmAccounts)
      .set({
        ...updateAccountDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.crmAccounts.id, id))
      .returning();

    return updatedAccount[0];
  }

  async remove(id: number, organizationId: number) {
    // Verify the account exists and belongs to the organization before soft-deleting
    await this.findOne(id, organizationId);

    await this.db
      .update(schema.crmAccounts)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(schema.crmAccounts.id, id));

    return; // Return nothing on successful delete
  }

  async export(organizationId: number): Promise<string> {
    const accounts = await this.db.query.crmAccounts.findMany({
        where: and(
            eq(schema.crmAccounts.organizationId, organizationId),
            eq(schema.crmAccounts.isDeleted, false),
        ),
        with: {
            owner: {
                columns: {
                    name: true,
                }
            }
        },
        orderBy: (accounts, { asc }) => [asc(accounts.name)],
    });

    const data = accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        industry: acc.industry,
        owner: (acc as any).owner?.name || 'Unassigned',
        createdAt: acc.createdAt.toISOString(),
        updatedAt: acc.updatedAt.toISOString(),
    }));

    return stringify(data, { header: true });
  }
}
