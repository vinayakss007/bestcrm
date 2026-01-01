
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
import { relatedToTypeEnum } from '../../db/schema';

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  private createComment(
    entityType: typeof relatedToTypeEnum.enumValues[number],
    entityId: number,
    createCommentDto: CreateCommentDto,
    user: User
    ) {
    return this.commentsService.create(
      createCommentDto,
      user.id,
      entityType,
      entityId,
      user.organizationId,
    );
  }

  private findComments(
    entityType: typeof relatedToTypeEnum.enumValues[number],
    entityId: number,
    user: User,
  ) {
    return this.commentsService.findAllFor(entityType, entityId, user.organizationId);
  }

  @Get('leads/:id/comments')
  findAllForLead(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.findComments('Lead', id, user);
  }

  @Post('leads/:id/comments')
  createForLead(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return this.createComment('Lead', id, createCommentDto, user);
  }

  @Get('accounts/:id/comments')
  findAllForAccount(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.findComments('Account', id, user);
  }

  @Post('accounts/:id/comments')
  createForAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return this.createComment('Account', id, createCommentDto, user);
  }

  @Get('contacts/:id/comments')
  findAllForContact(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.findComments('Contact', id, user);
  }

  @Post('contacts/:id/comments')
  createForContact(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return this.createComment('Contact', id, createCommentDto, user);
  }

  @Get('opportunities/:id/comments')
  findAllForOpportunity(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.findComments('Opportunity', id, user);
  }

  @Post('opportunities/:id/comments')
  createForOpportunity(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return this.createComment('Opportunity', id, createCommentDto, user);
  }
}
