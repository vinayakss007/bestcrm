
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AssignmentRulesService } from './assignment-rules.service';
import { CreateAssignmentRuleDto } from './dto/create-assignment-rule.dto';
import { UpdateAssignmentRuleDto } from './dto/update-assignment-rule.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { AuthenticatedUser } from '../users/users.service';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('assignment-rules')
export class AssignmentRulesController {
  constructor(private readonly assignmentRulesService: AssignmentRulesService) {}

  @Post()
  create(@Body() createAssignmentRuleDto: CreateAssignmentRuleDto, @GetUser() user: AuthenticatedUser) {
    return this.assignmentRulesService.create(createAssignmentRuleDto, user.organizationId);
  }

  @Get()
  findAll(@GetUser() user: AuthenticatedUser) {
    return this.assignmentRulesService.findAll(user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthenticatedUser) {
    return this.assignmentRulesService.remove(id, user.organizationId);
  }
}
