
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
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
        throw new Error('Invalid entity type for comment');
    }
    return type;
}

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':entityType/:entityId/comments')
  findAll(
    @Param('entityType') entityTypeString: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @GetUser() user: User,
  ) {
    const entityType = parseEntityType(entityTypeString);
    return this.commentsService.findAllFor(entityType, entityId, user.organizationId);
  }

  @Post(':entityType/:entityId/comments')
  create(
    @Param('entityType') entityTypeString: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    const entityType = parseEntityType(entityTypeString);
    return this.commentsService.create(
      createCommentDto,
      user.userId,
      entityType,
      entityId,
      user.organizationId,
    );
  }
}
