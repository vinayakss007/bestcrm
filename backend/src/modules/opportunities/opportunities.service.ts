
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, or, ilike, getTableColumns, sql, inArray } from 'drizzle-orm';
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
    userId: number,
  ) {
    return await this.db.transaction(async (tx) => {
        // Verify that the associated account belongs to the same organization
        const account = await tx.query.crmAccounts.findFirst({
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

        const newOpportunity = await tx
        .insert(schema.crmOpportunities)
        .values({
            ...createOpportunityDto,
            organizationId,
        })
        .returning();
        
        const opportunity = newOpportunity[0];

        // Log activity
        await tx.insert(schema.crmActivities).values({
            type: 'opportunity_created',
            details: { name: opportunity.name, accountName: account.name, amount: opportunity.amount },
            userId,
            organizationId,
            relatedToType: 'Account',
            relatedToId: account.id,
        });

        return opportunity;
    });
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
    
    // Join with accounts to search by account name
    let queryBuilder = this.db
      .select({
        ...getTableColumns(schema.crmOpportunities),
        account: {
          id: schema.crmAccounts.id,
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
            id: true,
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

  async getForecast(organizationId: number) {
    const openStages: (typeof schema.opportunityStageEnum.enumValues) = ['Prospecting', 'Qualification', 'Proposal', 'Closing'];
    
    const monthlyForecast = await this.db
      .select({
        month: sql<number>`extract(month from ${schema.crmOpportunities.closeDate})`.as('month'),
        total: sql<number>`sum(${schema.crmOpportunities.amount})`.mapWith(Number),
      })
      .from(schema.crmOpportunities)
      .where(and(
        eq(schema.crmOpportunities.organizationId, organizationId),
        inArray(schema.crmOpportunities.stage, openStages),
        sql`${schema.crmOpportunities.closeDate} IS NOT NULL`,
        sql`${schema.crmOpportunities.amount} IS NOT NULL`
      ))
      .groupBy(sql`month`);
      
    // The query returns month numbers (1-12). We'll return an object mapping month number to total.
    return monthlyForecast.reduce((acc, row) => {
        if (row.month) {
            acc[row.month -1] = row.total; // Convert 1-12 to 0-11 for JS Date object consistency
        }
        return acc;
    }, {} as Record<number, number>);
  }

  async getStats(organizationId: number) {
    const wonResult = await this.db
      .select({
        totalRevenue: sql<number>`sum(${schema.crmOpportunities.amount})`.mapWith(Number),
      })
      .from(schema.crmOpportunities)
      .where(and(
        eq(schema.crmOpportunities.organizationId, organizationId),
        eq(schema.crmOpportunities.stage, 'Won')
      ));
    
    const pipelineStages: (typeof schema.opportunityStageEnum.enumValues) = ['Prospecting', 'Qualification', 'Proposal', 'Closing'];
    const activeAndPipelineResult = await this.db
        .select({
            count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(schema.crmOpportunities)
        .where(and(
            eq(schema.crmOpportunities.organizationId, organizationId),
            inArray(schema.crmOpportunities.stage, pipelineStages)
        ));

    const totalResult = await this.db
        .select({
            count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(schema.crmOpportunities)
        .where(and(
            eq(schema.crmOpportunities.organizationId, organizationId),
            eq(schema.crmOpportunities.isDeleted, false)
        ));

    return {
        totalRevenue: wonResult[0].totalRevenue || 0,
        totalOpportunities: totalResult[0].count || 0,
        pipelineOpportunities: activeAndPipelineResult[0].count || 0,
    }
  }
}
