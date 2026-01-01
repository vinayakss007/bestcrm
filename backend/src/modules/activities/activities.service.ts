
import {
  Injectable,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';

export type Activity = {
  id: string;
  type: 'new_contact' | 'new_opportunity' | 'account_created';
  timestamp: Date;
  user: { id: number; name: string; avatarUrl: string | null };
  details: any;
};

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAllForAccount(
    accountId: number,
    organizationId: number,
  ): Promise<Activity[]> {
    // 1. Verify user has access to this account
    const account = await this.db.query.crmAccounts.findFirst({
      where: and(
        eq(schema.crmAccounts.id, accountId),
        eq(schema.crmAccounts.organizationId, organizationId),
      ),
      with: {
        owner: {
            columns: {
                id: true,
                name: true,
                avatarUrl: true
            }
        }
      }
    });

    if (!account) {
      throw new ForbiddenException(
        'Account not found or you do not have permission to access it.',
      );
    }
    
    // 2. Fetch related contacts and opportunities
    const contacts = await this.db.query.crmContacts.findMany({
        where: eq(schema.crmContacts.accountId, accountId)
    });

    const opportunities = await this.db.query.crmOpportunities.findMany({
        where: eq(schema.crmOpportunities.accountId, accountId)
    });

    const users = await this.db.query.crmUsers.findMany({
        where: eq(schema.crmUsers.organizationId, organizationId),
        columns: {
            id: true,
            name: true,
            avatarUrl: true
        }
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const getActionUser = (userId: number | null) => {
        const defaultUser = { id: 0, name: 'System', avatarUrl: null };
        if (!userId) return defaultUser;
        return userMap.get(userId) || defaultUser;
    }

    // 3. Transform them into a unified Activity type
    const contactActivities: Activity[] = contacts.map(contact => ({
        id: `contact-${contact.id}`,
        type: 'new_contact',
        timestamp: contact.createdAt,
        user: getActionUser(account.ownerId), // Assuming account owner created the contact for now
        details: {
            name: contact.name,
            email: contact.email,
        }
    }));
    
    const opportunityActivities: Activity[] = opportunities.map(opp => ({
        id: `opportunity-${opp.id}`,
        type: 'new_opportunity',
        timestamp: opp.createdAt,
        user: getActionUser(opp.ownerId),
        details: {
            name: opp.name,
            stage: opp.stage,
            amount: opp.amount
        }
    }));

    const accountCreatedActivity: Activity = {
        id: `account-${account.id}`,
        type: 'account_created',
        timestamp: account.createdAt,
        user: getActionUser(account.ownerId),
        details: {
            name: account.name,
        }
    };
    
    // 4. Combine and sort
    const allActivities = [
        accountCreatedActivity,
        ...contactActivities, 
        ...opportunityActivities
    ];

    allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return allActivities;
  }
}
