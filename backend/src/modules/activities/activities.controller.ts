
import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/users.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('accounts/:accountId/activities')
  findAllForAccount(
    @Param('accountId', ParseIntPipe) accountId: number,
    @GetUser() user: User,
  ) {
    return this.activitiesService.findAllForAccount(accountId, user.organizationId);
  }
}
