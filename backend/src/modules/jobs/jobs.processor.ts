
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { stringify } from 'csv-stringify/sync';

import { DrizzleProvider } from '../drizzle/drizzle.provider';
import * as schema from '@/db/schema';

@Processor('export')
export class AccountExportProcessor extends WorkerHost {
    constructor(
        @Inject(DrizzleProvider) private db: PostgresJsDatabase<typeof schema>,
    ) {
        super();
    }

    async process(job: Job<{ organizationId: number }>): Promise<string> {
        const { organizationId } = job.data;
        
        console.log(`Processing account export for organization ${organizationId}`);

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

        const csv = stringify(data, { header: true });
        console.log(`Finished processing account export for organization ${organizationId}`);
        return csv;
    }
}
