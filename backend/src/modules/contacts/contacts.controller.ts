
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
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/users.service';

@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto, @GetUser() user: User) {
    return this.contactsService.create(createContactDto, user.organizationId);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.contactsService.findAll(user.organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.contactsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
    @GetUser() user: User,
  ) {
    return this.contactsService.update(id, updateContactDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.contactsService.remove(id, user.organizationId);
  }
}
