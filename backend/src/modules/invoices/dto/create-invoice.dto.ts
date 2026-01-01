
import { IsInt, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { InvoiceStatusEnum } from '../../../enums';

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

  @IsEnum(InvoiceStatusEnum)
  @IsOptional()
  status?: (typeof InvoiceStatusEnum)[number];
}
