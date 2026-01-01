
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

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('leads/:id/comments')
  findAllForLead(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.commentsService.findAllFor('Lead', id, user.organizationId);
  }

  @Post('leads/:id/comments')
  createForLead(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return this.commentsService.create(
      createCommentDto,
      user.userId,
      'Lead',
      id,
      user.organizationId,
    );
  }
}
