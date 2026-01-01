
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, or, ilike } from 'drizzle-orm';
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

  async create(createContactDto: CreateContactDto, organizationId: number) {
    // Verify that the account being assigned belongs to the same organization
    const account = await this.db.query.crmAccounts.findFirst({
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

    const newContact = await this.db
      .insert(schema.crmContacts)
      .values({
        ...createContactDto,
        organizationId,
      })
      .returning();

    return newContact[0];
  }

  async findAll(organizationId: number, accountId?: number, query?: string) {
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

    return await this.db.query.crmContacts.findMany({
      where: and(...conditions),
      with: {
        account: {
            columns: {
                name: true,
            }
        }
      }
    });
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
