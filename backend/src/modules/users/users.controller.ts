
import { Controller, Get, UseGuards, Patch, Param, ParseIntPipe, Body, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService, AuthenticatedUser } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';


@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @RequirePermission('user:read')
    findAll(@GetUser() user: AuthenticatedUser) {
        // Pass the whole user object to the service
        return this.usersService.findAll(user);
    }

    @Post('invite')
    @RequirePermission('user:create')
    invite(@Body() inviteUserDto: InviteUserDto, @GetUser() user: AuthenticatedUser) {
        // The service will use the inviting user's organizationId
        return this.usersService.invite(inviteUserDto, user);
    }

    @Post(':id/impersonate')
    @HttpCode(HttpStatus.OK)
    @RequirePermission('super-admin:tenant:impersonate')
    impersonate(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthenticatedUser) {
        return this.usersService.impersonate(id, user);
    }

    @Patch(':id')
    @RequirePermission('user:update')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
        @GetUser() user: AuthenticatedUser
    ) {
        // Add security check to ensure user can only update themselves (or has permissions)
        // For now, we'll just pass the organizationId for scoping
        return this.usersService.update(id, updateUserDto, user.organizationId);
    }
}
