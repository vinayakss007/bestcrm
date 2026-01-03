
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, or, ilike, sql } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(createContactDto: CreateContactDto, organizationId: number, userId: number) {
    return await this.db.transaction(async (tx) => {
        // Verify that the account being assigned belongs to the same organization
        const account = await tx.query.crmAccounts.findFirst({
        where: and(
            eq(schema.crmAccounts.id, createContactDto.accountId),
            eq(schema.crmAccounts.organizationId, organizationId),
        ),
        });

        if (!account) {
        throw new ForbiddenException(
            'Account not found or does not belong to your organization.',
        );
        }

        const newContact = await tx
        .insert(schema.crmContacts)
        .values({
            ...createContactDto,
            organizationId,
        })
        .returning();

        const contact = newContact[0];

        // Log activity
        await tx.insert(schema.crmActivities).values({
            type: 'contact_created',
            details: { name: contact.name, accountName: account.name },
            userId,
            organizationId,
            relatedToType: 'Account',
            relatedToId: account.id,
        });

        return contact;
    });
  }

  async findAll(
    organizationId: number,
    accountId?: number,
    query?: string,
    page: number = 1,
    limit: number = 10
    ) {
    const conditions = [
        eq(schema.crmContacts.organizationId, organizationId),
        eq(schema.crmContacts.isDeleted, false),
    ];

    if (accountId) {
        // First, verify the requesting user has access to this account.
        const account = await this.db.query.crmAccounts.findFirst({
            where: and(
                eq(schema.crmAccounts.id, accountId),
                eq(schema.crmAccounts.organizationId, organizationId)
            )
        });
        if (!account) {
            throw new ForbiddenException("Access to this account's contacts is denied.");
        }
        conditions.push(eq(schema.crmContacts.accountId, accountId));
    }

    if (query) {
        conditions.push(
            or(
                ilike(schema.crmContacts.name, `%${query}%`),
                ilike(schema.crmContacts.email, `%${query}%`)
            )
        )
    }

    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
        this.db.query.crmContacts.findMany({
            where: and(...conditions),
            with: {
                account: {
                    columns: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: (contacts, { asc }) => [asc(contacts.name)],
            limit: limit,
            offset: offset,
        }),
        this.db.select({ count: sql<number>`count(*)` }).from(schema.crmContacts).where(and(...conditions))
    ]);
    
    return {
        data,
        total: totalResult[0].count,
    };
  }

  async findOne(id: number, organizationId: number) {
    const contact = await this.db.query.crmContacts.findFirst({
      where: and(
        eq(schema.crmContacts.id, id),
        eq(schema.crmContacts.organizationId, organizationId),
        eq(schema.crmContacts.isDeleted, false),
      ),
       with: {
        account: {
            columns: {
                id: true,
                name: true,
            }
        }
      }
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async update(
    id: number,
    updateContactDto: UpdateContactDto,
    organizationId: number,
  ) {
    // First, verify the contact exists and belongs to the user's organization
    await this.findOne(id, organizationId);

    if (updateContactDto.accountId) {
        // If accountId is being changed, verify the new account also belongs to the organization
        const account = await this.db.query.crmAccounts.findFirst({
            where: and(
                eq(schema.crmAccounts.id, updateContactDto.accountId),
                eq(schema.crmAccounts.organizationId, organizationId),
            ),
        });
        if (!account) {
            throw new ForbiddenException(
                'New account not found or does not belong to your organization.',
            );
        }
    }

    const updatedContact = await this.db
      .update(schema.crmContacts)
      .set({
        ...updateContactDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.crmContacts.id, id))
      .returning();

    return updatedContact[0];
  }

  async remove(id: number, organizationId: number) {
    // Verify the contact exists and belongs to the organization before soft-deleting
    await this.findOne(id, organizationId);

    await this.db
      .update(schema.crmContacts)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(schema.crmContacts.id, id));

    return; // Return nothing on successful delete
  }
}
