
import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

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

  async findAll(organizationId: number) {
    // In a real app, you'd probably join with the users table to get owner name
    return await this.db.query.crmLeads.findMany({
      where: and(
        eq(schema.crmLeads.organizationId, organizationId),
        eq(schema.crmLeads.isDeleted, false),
      ),
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
}
