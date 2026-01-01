
import { IsEnum, IsOptional } from 'class-validator';
import { invoiceStatusEnum } from '@/db/schema';

export class UpdateInvoiceDto {
  @IsEnum(invoiceStatusEnum.enumValues)
  @IsOptional()
  status?: (typeof invoiceStatusEnum.enumValues)[number];
}
