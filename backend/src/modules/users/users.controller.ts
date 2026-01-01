
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';

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
}
