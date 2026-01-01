
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
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/users.service';
import { ConvertLeadDto } from './dto/convert-lead.dto';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() createLeadDto: CreateLeadDto, @GetUser() user: User) {
    return this.leadsService.create(createLeadDto, user.organizationId, user.userId);
  }

  @Get()
  findAll(@GetUser() user: User, @Query('query') query?: string) {
    return this.leadsService.findAll(user.organizationId, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.leadsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeadDto: UpdateLeadDto,
    @GetUser() user: User,
  ) {
    return this.leadsService.update(id, updateLeadDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.leadsService.remove(id, user.organizationId);
  }

  @Post(':id/convert')
  convert(
    @Param('id', ParseIntPipe) id: number,
    @Body() convertLeadDto: ConvertLeadDto,
    @GetUser() user: User,
  ) {
    return this.leadsService.convert(id, convertLeadDto, user.organizationId, user.userId);
  }
}
