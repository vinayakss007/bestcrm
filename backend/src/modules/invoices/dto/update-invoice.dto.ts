
import { IsEnum, IsOptional } from 'class-validator';
import { InvoiceStatusEnum } from '../../../enums';

export class UpdateInvoiceDto {
  @IsEnum(InvoiceStatusEnum)
  @IsOptional()
  status?: (typeof InvoiceStatusEnum)[number];
}
