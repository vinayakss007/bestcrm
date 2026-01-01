
import { IsInt, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { invoiceStatusEnum } from '@/db/schema';

export class CreateInvoiceDto {
  @IsInt()
  @IsNotEmpty()
  leadId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsEnum(invoiceStatusEnum.enumValues)
  @IsOptional()
  status?: (typeof invoiceStatusEnum.enumValues)[number];
}
