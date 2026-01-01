
import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { relatedToTypeEnum } from '@/db/schema';
import { User } from '../users/users.service';

type RelatedToType = typeof relatedToTypeEnum.enumValues[number];

@Injectable()
export class AttachmentsService {
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
    file: Express.Multer.File,
    relatedToType: RelatedToType,
    relatedToId: number,
    user: User,
  ) {
    // Ensure the user has permission to attach a file to this entity
    await this.verifyRelatedEntity(relatedToType, relatedToId, user.organizationId);

    const newAttachment = await this.db
      .insert(schema.crmAttachments)
      .values({
        originalName: file.originalname,
        fileName: file.filename,
        fileType: file.mimetype,
        fileSize: file.size,
        userId: user.userId,
        relatedToType,
        relatedToId,
        organizationId: user.organizationId,
      })
      .returning();

    return newAttachment[0];
  }

  async findAllFor(
    relatedToType: RelatedToType,
    relatedToId: number,
    organizationId: number,
  ) {
    // Ensure the user has permission to view this entity's attachments
    await this.verifyRelatedEntity(relatedToType, relatedToId, organizationId);

    return await this.db.query.crmAttachments.findMany({
      where: and(
        eq(schema.crmAttachments.relatedToType, relatedToType),
        eq(schema.crmAttachments.relatedToId, relatedToId),
        eq(schema.crmAttachments.organizationId, organizationId),
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
      orderBy: (attachments, { desc }) => [desc(attachments.createdAt)],
    });
  }

  async download(id: number, organizationId: number) {
    const attachment = await this.db.query.crmAttachments.findFirst({
        where: and(
            eq(schema.crmAttachments.id, id),
            eq(schema.crmAttachments.organizationId, organizationId),
        ),
    });

    if (!attachment) {
        throw new NotFoundException('Attachment not found or you do not have permission to access it.');
    }
    
    const file = createReadStream(join(process.cwd(), 'uploads', attachment.fileName));
    return {
        fileStream: new StreamableFile(file),
        attachment: attachment,
    };
  }
}
