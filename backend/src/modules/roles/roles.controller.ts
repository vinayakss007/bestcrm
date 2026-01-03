
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { AuthenticatedUser } from '../users/users.service';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermission('role:create')
  create(@Body() createRoleDto: CreateRoleDto, @GetUser() user: AuthenticatedUser) {
    return this.rolesService.create(createRoleDto, user);
  }

  @Get()
  @RequirePermission('role:read')
  findAll(@GetUser() user: AuthenticatedUser) {
    return this.rolesService.findAll(user.organizationId);
  }

  @Get('permissions')
  @RequirePermission('role:read')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get(':id')
  @RequirePermission('role:read')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthenticatedUser) {
    return this.rolesService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @RequirePermission('role:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto, @GetUser() user: AuthenticatedUser) {
    return this.rolesService.update(id, updateRoleDto, user);
  }

  @Delete(':id')
  @RequirePermission('role:delete')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthenticatedUser) {
    return this.rolesService.remove(id, user);
  }
}
