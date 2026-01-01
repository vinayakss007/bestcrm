
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/users.service';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto, @GetUser() user: User) {
    // Pass organizationId from the authenticated user to the service
    return this.accountsService.create(createAccountDto, user.organizationId);
  }

  @Get()
  findAll(@GetUser() user: User) {
    // Pass organizationId to scope the query
    return this.accountsService.findAll(user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    // Pass organizationId to scope the query
    return this.accountsService.findOne(+id, user.organizationId);
  }
}
