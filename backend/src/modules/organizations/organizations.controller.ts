
import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe, Get } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { AuthenticatedUser } from '../users/users.service';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @RequirePermission('super-admin:tenant:read')
  findAll(@GetUser() user: AuthenticatedUser) {
    return this.organizationsService.findAll(user);
  }

  @Patch(':id')
  @RequirePermission('setting:brand:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @GetUser() user: AuthenticatedUser
  ) {
    // The service will ensure the user is authorized to update this organization
    return this.organizationsService.update(id, updateOrganizationDto, user);
  }
}
