
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, or, ilike, getTableColumns } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(
    createOpportunityDto: CreateOpportunityDto,
    organizationId: number,
  ) {
    // Verify that the associated account belongs to the same organization
    const account = await this.db.query.crmAccounts.findFirst({
      where: and(
        eq(schema.crmAccounts.id, createOpportunityDto.accountId),
        eq(schema.crmAccounts.organizationId, organizationId),
      ),
    });

    if (!account) {
      throw new ForbiddenException(
        'Account not found or does not belong to your organization.',
      );
    }

    const newOpportunity = await this.db
      .insert(schema.crmOpportunities)
      .values({
        ...createOpportunityDto,
        organizationId,
      })
      .returning();

    return newOpportunity[0];
  }

  async findAll(organizationId: number, accountId?: number, query?: string) {
     const conditions = [
        eq(schema.crmOpportunities.organizationId, organizationId),
        eq(schema.crmOpportunities.isDeleted, false),
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
            throw new ForbiddenException("Access to this account's opportunities is denied.");
        }
        conditions.push(eq(schema.crmOpportunities.accountId, accountId));
    }
    
    // Base query
    let queryBuilder = this.db
      .select({
        ...getTableColumns(schema.crmOpportunities),
        account: {
          name: schema.crmAccounts.name,
        },
        owner: {
          name: schema.crmUsers.name,
          avatarUrl: schema.crmUsers.avatarUrl,
        }
      })
      .from(schema.crmOpportunities)
      .leftJoin(schema.crmAccounts, eq(schema.crmOpportunities.accountId, schema.crmAccounts.id))
      .leftJoin(schema.crmUsers, eq(schema.crmOpportunities.ownerId, schema.crmUsers.id))


    if (query) {
        conditions.push(
            or(
                ilike(schema.crmOpportunities.name, `%${query}%`),
                ilike(schema.crmAccounts.name, `%${query}%`) 
            )
        )
    }
    
    return await queryBuilder
        .where(and(...conditions))
        .orderBy(schema.crmOpportunities.createdAt);
  }

  async findOne(id: number, organizationId: number) {
    const opportunity = await this.db.query.crmOpportunities.findFirst({
      where: and(
        eq(schema.crmOpportunities.id, id),
        eq(schema.crmOpportunities.organizationId, organizationId),
        eq(schema.crmOpportunities.isDeleted, false),
      ),
      with: {
        account: {
          columns: {
            name: true,
          },
        },
        owner: {
            columns: {
                name: true,
                avatarUrl: true
            }
        }
      }
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
    return opportunity;
  }

  async update(
    id: number,
    updateOpportunityDto: UpdateOpportunityDto,
    organizationId: number,
  ) {
    // First, verify the opportunity exists and belongs to the user's organization
    await this.findOne(id, organizationId);

    const updatedOpportunity = await this.db
      .update(schema.crmOpportunities)
      .set({
        ...updateOpportunityDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.crmOpportunities.id, id))
      .returning();

    return updatedOpportunity[0];
  }

  async remove(id: number, organizationId: number) {
    // Verify the opportunity exists and belongs to the organization
    await this.findOne(id, organizationId);

    await this.db
      .update(schema.crmOpportunities)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(schema.crmOpportunities.id, id));

    return;
  }
}

    