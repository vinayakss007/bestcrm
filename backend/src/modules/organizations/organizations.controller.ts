
import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';

type AuthenticatedUser = {
    userId: number;
    organizationId: number;
    role: 'user' | 'company-admin' | 'super-admin';
}

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

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
