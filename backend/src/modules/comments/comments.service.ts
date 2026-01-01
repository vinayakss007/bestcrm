
import {
  Injectable,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { CreateCommentDto } from './dto/create-comment.dto';
import { relatedToTypeEnum } from '@/db/schema';

type RelatedToType = typeof relatedToTypeEnum.enumValues[number];

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  private async verifyRelatedEntity(
    type: RelatedToType,
    id: number,
    organizationId: number,
  ) {
    let entity: any;
    const commonWhere = (table: any) =>
      and(eq(table.id, id), eq(table.organizationId, organizationId));

    switch (type) {
      case 'Lead':
        entity = await this.db.query.crmLeads.findFirst({ where: commonWhere(schema.crmLeads) });
        break;
      case 'Account':
        entity = await this.db.query.crmAccounts.findFirst({ where: commonWhere(schema.crmAccounts) });
        break;
      case 'Contact':
        entity = await this.db.query.crmContacts.findFirst({ where: commonWhere(schema.crmContacts) });
        break;
      case 'Opportunity':
        entity = await this.db.query.crmOpportunities.findFirst({ where: commonWhere(schema.crmOpportunities) });
        break;
      default:
        entity = null;
    }
    if (!entity) {
      throw new ForbiddenException(
        `Related ${type} not found or does not belong to your organization.`,
      );
    }
  }

  async create(
    createCommentDto: CreateCommentDto,
    userId: number,
    relatedToType: RelatedToType,
    relatedToId: number,
    organizationId: number,
  ) {
    // Ensure the user has permission to comment on this entity
    await this.verifyRelatedEntity(relatedToType, relatedToId, organizationId);

    const newComment = await this.db
      .insert(schema.crmComments)
      .values({
        ...createCommentDto,
        userId,
        relatedToType,
        relatedToId,
        organizationId,
      })
      .returning();

    return newComment[0];
  }

  async findAllFor(
    relatedToType: RelatedToType,
    relatedToId: number,
    organizationId: number,
  ) {
    // Ensure the user has permission to view this entity
    await this.verifyRelatedEntity(relatedToType, relatedToId, organizationId);

    return await this.db.query.crmComments.findMany({
      where: and(
        eq(schema.crmComments.relatedToType, relatedToType),
        eq(schema.crmComments.relatedToId, relatedToId),
        eq(schema.crmComments.organizationId, organizationId),
      ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: (comments, { desc }) => [desc(comments.createdAt)],
    });
  }
}
