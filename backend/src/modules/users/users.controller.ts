
import { Controller, Get, UseGuards, Patch, Param, ParseIntPipe, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

// This is the user type from the JWT payload, not the DB model
type AuthenticatedUser = {
    userId: number;
    email: string;
    organizationId: number;
    role: string;
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll(@GetUser() user: AuthenticatedUser) {
        return this.usersService.findAll(user.organizationId);
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
