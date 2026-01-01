
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt, IsEnum } from 'class-validator';
import { LeadStatusEnum } from '../../../enums';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsEnum(LeadStatusEnum)
  @IsOptional()
  status?: (typeof LeadStatusEnum)[number];

  @IsInt()
  @IsOptional()
  ownerId?: number;
}
