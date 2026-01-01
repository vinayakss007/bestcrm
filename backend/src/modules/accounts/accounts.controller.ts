
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/users.service';
import { UpdateAccountDto } from './dto/update-account.dto';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto, @GetUser() user: User) {
    // Pass organizationId and userId from the authenticated user to the service
    return this.accountsService.create(createAccountDto, user.organizationId, user.userId);
  }

  @Get()
  findAll(@GetUser() user: User, @Query('query') query?: string) {
    // Pass organizationId and optional query to scope the query
    return this.accountsService.findAll(user.organizationId, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    // Pass organizationId to scope the query
    return this.accountsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
    @GetUser() user: User,
  ) {
    return this.accountsService.update(id, updateAccountDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.accountsService.remove(id, user.organizationId);
  }
}
