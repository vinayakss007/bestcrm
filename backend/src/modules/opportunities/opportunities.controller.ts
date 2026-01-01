
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/users.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post('opportunities')
  create(
    @Body() createOpportunityDto: CreateOpportunityDto,
    @GetUser() user: User,
  ) {
    return this.opportunitiesService.create(
      createOpportunityDto,
      user.organizationId,
    );
  }

  @Get('opportunities')
  findAll(@GetUser() user: User) {
    return this.opportunitiesService.findAll(user.organizationId);
  }

  @Get('accounts/:accountId/opportunities')
  findAllForAccount(
      @Param('accountId', ParseIntPipe) accountId: number,
      @GetUser() user: User
  ) {
      return this.opportunitiesService.findAll(user.organizationId, accountId);
  }

  @Get('opportunities/:id')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.opportunitiesService.findOne(id, user.organizationId);
  }

  @Patch('opportunities/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
    @GetUser() user: User,
  ) {
    return this.opportunitiesService.update(
      id,
      updateOpportunityDto,
      user.organizationId,
    );
  }

  @Delete('opportunities/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.opportunitiesService.remove(id, user.organizationId);
  }
}
