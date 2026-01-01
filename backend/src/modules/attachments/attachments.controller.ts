
import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Response } from 'express';

import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/users.service';
import { relatedToTypeEnum } from '@/db/schema';

const parseEntityType = (entity: string): (typeof relatedToTypeEnum.enumValues)[number] => {
    const map: Record<string, (typeof relatedToTypeEnum.enumValues)[number]> = {
        'leads': 'Lead',
        'accounts': 'Account',
        'contacts': 'Contact',
        'opportunities': 'Opportunity',
    };
    const type = map[entity];
    if (!type) {
        throw new Error('Invalid entity type for attachment');
    }
    return type;
}

@UseGuards(JwtAuthGuard)
@Controller()
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  private findAttachments(
    entityType: (typeof relatedToTypeEnum.enumValues)[number],
    entityId: number,
    user: User,
  ) {
    return this.attachmentsService.findAllFor(entityType, entityId, user.organizationId);
  }

  private uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    entityType: (typeof relatedToTypeEnum.enumValues)[number],
    entityId: number,
    user: User,
  ) {
    return this.attachmentsService.create(file, entityType, entityId, user);
  }

  @Get(':entityType/:entityId/attachments')
  findAll(
    @Param('entityType') entityTypeString: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @GetUser() user: User,
  ) {
    const entityType = parseEntityType(entityTypeString);
    return this.findAttachments(entityType, entityId, user);
  }

  @Post(':entityType/:entityId/attachments')
  @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
              const uniqueSuffix = uuidv4();
              const extension = extname(file.originalname);
              cb(null, `${uniqueSuffix}${extension}`);
          },
      }),
  }))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Param('entityType') entityTypeString: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @GetUser() user: User,
  ) {
    const entityType = parseEntityType(entityTypeString);
    return this.uploadAttachment(file, entityType, entityId, user);
  }

  @Get('attachments/:id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
      const { fileStream, attachment } = await this.attachmentsService.download(id, user.organizationId);
      res.set({
          'Content-Type': attachment.fileType,
          'Content-Disposition': `attachment; filename="${attachment.originalName}"`,
      });
      return fileStream;
  }
}
