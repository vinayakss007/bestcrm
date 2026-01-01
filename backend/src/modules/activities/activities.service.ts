
import {
  Injectable,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAll(organizationId: number) {
    return await this.db.query.crmActivities.findMany({
        where: eq(schema.crmActivities.organizationId, organizationId),
        orderBy: [desc(schema.crmActivities.createdAt)],
        limit: 20, // Limit to recent activities for the dashboard
        with: {
            user: {
                columns: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                }
            }
        }
    });
  }

  async findAllForAccount(
    accountId: number,
    organizationId: number,
  ) {
    // 1. Verify user has access to this account
    const account = await this.db.query.crmAccounts.findFirst({
      where: and(
        eq(schema.crmAccounts.id, accountId),
        eq(schema.crmAccounts.organizationId, organizationId),
      ),
    });

    if (!account) {
      throw new ForbiddenException(
        'Account not found or you do not have permission to access it.',
      );
    }
    
    // 2. Fetch related activities from the new table
    return await this.db.query.crmActivities.findMany({
        where: and(
            eq(schema.crmActivities.organizationId, organizationId),
            eq(schema.crmActivities.relatedToType, 'Account'),
            eq(schema.crmActivities.relatedToId, accountId)
        ),
        orderBy: [desc(schema.crmActivities.createdAt)],
        with: {
            user: {
                columns: {
                    id: true,
                    name: true,
                    avatarUrl: true
                }
            }
        }
    });
  }
}
