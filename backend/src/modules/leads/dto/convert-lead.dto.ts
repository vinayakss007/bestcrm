
import { IsString, IsNotEmpty } from 'class-validator';

export class ConvertLeadDto {
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @IsNotEmpty()
  opportunityName: string;
}
