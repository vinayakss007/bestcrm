
import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe, Get } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { AuthenticatedUser } from '../users/users.service';

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll(@GetUser() user: AuthenticatedUser) {
    // The service will ensure only a super-admin can access this
    return this.organizationsService.findAll(user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @GetUser() user: AuthenticatedUser
  ) {
    // The service will ensure the user is authorized to update this organization
    return this.organizationsService.update(id, updateOrganizationDto, user);
  }
}
