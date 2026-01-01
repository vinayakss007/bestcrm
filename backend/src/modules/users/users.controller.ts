
import { Controller, Get, UseGuards, Patch, Param, ParseIntPipe, Body, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';

// This is the user type from the JWT payload, not the DB model
type AuthenticatedUser = {
    userId: number;
    email: string;
    organizationId: number;
    role: 'user' | 'company-admin' | 'super-admin';
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll(@GetUser() user: AuthenticatedUser) {
        // Pass the whole user object to the service
        return this.usersService.findAll(user);
    }

    @Post('invite')
    invite(@Body() inviteUserDto: InviteUserDto, @GetUser() user: AuthenticatedUser) {
        // The service will use the inviting user's organizationId
        return this.usersService.invite(inviteUserDto, user);
    }

    @Patch(':id')
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
