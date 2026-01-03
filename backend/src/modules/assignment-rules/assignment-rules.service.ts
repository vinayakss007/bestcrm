
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { CreateAssignmentRuleDto } from './dto/create-assignment-rule.dto';
import type { Lead, Opportunity } from '@/lib/types';
import { crmLeads, crmOpportunities } from '@/db/schema';

type TransactionDB = Omit<PostgresJsDatabase<typeof schema>, 'query'>

@Injectable()
export class AssignmentRulesService {
    constructor(
        @Inject(DrizzleProvider) private db: PostgresJsDatabase<typeof schema>,
    ) {}

    async create(createAssignmentRuleDto: CreateAssignmentRuleDto, organizationId: number) {
        const [newRule] = await this.db.insert(schema.crmAssignmentRules).values({
            ...createAssignmentRuleDto,
            organizationId,
        }).returning();
        return newRule;
    }

    async findAll(organizationId: number) {
        return this.db.query.crmAssignmentRules.findMany({
            where: eq(schema.crmAssignmentRules.organizationId, organizationId),
            orderBy: (rules, { asc }) => [asc(rules.createdAt)],
        });
    }

    async remove(id: number, organizationId: number) {
        const rule = await this.db.query.crmAssignmentRules.findFirst({
            where: and(
                eq(schema.crmAssignmentRules.id, id),
                eq(schema.crmAssignmentRules.organizationId, organizationId),
            ),
        });

        if (!rule) {
            throw new NotFoundException('Assignment rule not found.');
        }

        await this.db.delete(schema.crmAssignmentRules).where(eq(schema.crmAssignmentRules.id, id));
    }

    async applyRules<T extends Lead | Opportunity>(
        objectType: 'Lead' | 'Opportunity', 
        record: T, 
        organizationId: number,
        tx: TransactionDB
    ): Promise<T> {
        const rules = await this.db.query.crmAssignmentRules.findMany({
            where: and(
                eq(schema.crmAssignmentRules.organizationId, organizationId),
                eq(schema.crmAssignmentRules.object, objectType),
            ),
            orderBy: (rules, { asc }) => [asc(rules.createdAt)],
        });

        for (const rule of rules) {
            // This is a simple implementation. A real-world scenario would need to handle
            // different operators (contains, starts with, etc.) and field types.
            const recordValue = (record as any)[rule.conditionField];
            if (recordValue && recordValue.toLowerCase() === rule.conditionValue.toLowerCase()) {
                // Rule matches, assign and stop processing.
                const table = objectType === 'Lead' ? crmLeads : crmOpportunities;
                
                const [updatedRecord] = await tx.update(table)
                    .set({ ownerId: rule.assignToId })
                    .where(eq(table.id, record.id))
                    .returning();

                return updatedRecord as T;
            }
        }
        
        // No rules matched, return original record
        return record;
    }
}
