
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/users.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post('contacts')
  create(@Body() createContactDto: CreateContactDto, @GetUser() user: User) {
    return this.contactsService.create(createContactDto, user.organizationId, user.userId);
  }

  @Get('contacts')
  findAll(
    @GetUser() user: User,
    @Query('accountId', new ParseIntPipe({ optional: true })) accountId?: number,
    @Query('query') query?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    ) {
    return this.contactsService.findAll(user.organizationId, accountId, query, page, limit);
  }

  @Get('accounts/:accountId/contacts')
  findAllForAccount(
      @Param('accountId', ParseIntPipe) accountId: number,
      @GetUser() user: User,
      @Query('query') query?: string,
      @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
      @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
      return this.contactsService.findAll(user.organizationId, accountId, query, page, limit);
  }

  @Get('contacts/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.contactsService.findOne(id, user.organizationId);
  }

  @Patch('contacts/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
    @GetUser() user: User,
  ) {
    return this.contactsService.update(id, updateContactDto, user.organizationId);
  }

  @Delete('contacts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.contactsService.remove(id, user.organizationId);
  }
}
