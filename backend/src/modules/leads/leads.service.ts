
import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, or, ilike } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(createLeadDto: CreateLeadDto, organizationId: number) {
    const newLead = await this.db
      .insert(schema.crmLeads)
      .values({
        ...createLeadDto,
        organizationId,
      })
      .returning();

    return newLead[0];
  }

  async findAll(organizationId: number, query?: string) {
    const conditions = [
        eq(schema.crmLeads.organizationId, organizationId),
        eq(schema.crmLeads.isDeleted, false),
    ];

    if (query) {
        conditions.push(
            or(
                ilike(schema.crmLeads.name, `%${query}%`),
                ilike(schema.crmLeads.email, `%${query}%`),
                ilike(schema.crmLeads.source, `%${query}%`)
            )
        )
    }

    return await this.db.query.crmLeads.findMany({
      where: and(...conditions),
      with: {
        owner: {
          columns: {
            name: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: (leads, { desc }) => [desc(leads.createdAt)],
    });
  }

  async findOne(id: number, organizationId: number) {
    const lead = await this.db.query.crmLeads.findFirst({
      where: and(
        eq(schema.crmLeads.id, id),
        eq(schema.crmLeads.organizationId, organizationId),
        eq(schema.crmLeads.isDeleted, false),
      ),
      with: {
        owner: {
          columns: {
            name: true,
            avatarUrl: true,
          }
        }
      }
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return lead;
  }

  async update(id: number, updateLeadDto: UpdateLeadDto, organizationId: number) {
    // Verify the lead exists and belongs to the organization
    await this.findOne(id, organizationId);

    const updatedLead = await this.db
      .update(schema.crmLeads)
      .set({
        ...updateLeadDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.crmLeads.id, id))
      .returning();

    return updatedLead[0];
  }

  async remove(id: number, organizationId: number) {
    // Verify the lead exists and belongs to the organization
    await this.findOne(id, organizationId);

    await this.db
      .update(schema.crmLeads)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(schema.crmLeads.id, id));

    return;
  }

  async convert(leadId: number, convertLeadDto: ConvertLeadDto, organizationId: number, ownerId: number) {
    const lead = await this.findOne(leadId, organizationId);
    if (lead.isDeleted) {
        throw new ConflictException('Cannot convert a deleted lead.');
    }

    return await this.db.transaction(async (tx) => {
        // 1. Create Account
        const newAccount = await tx.insert(schema.crmAccounts).values({
            name: convertLeadDto.accountName,
            organizationId,
            ownerId: ownerId,
        }).returning();

        // 2. Create Contact
        const newContact = await tx.insert(schema.crmContacts).values({
            name: lead.name,
            email: lead.email,
            accountId: newAccount[0].id,
            organizationId,
        }).returning();

        // 3. Create Opportunity
        const newOpportunity = await tx.insert(schema.crmOpportunities).values({
            name: convertLeadDto.opportunityName,
            accountId: newAccount[0].id,
            ownerId: ownerId,
            organizationId,
            stage: 'Qualification', // Default stage after conversion
            // You can add more fields here like amount, closeDate if needed
        }).returning();

        // 4. Update the original lead
        await tx.update(schema.crmLeads).set({
            status: 'Qualified',
            isDeleted: true,
            deletedAt: new Date(),
        }).where(eq(schema.crmLeads.id, leadId));
        
        return { opportunityId: newOpportunity[0].id };
    });
  }
}
