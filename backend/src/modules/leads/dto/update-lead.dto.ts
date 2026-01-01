
import { IsString, IsEmail, IsOptional, IsInt, IsEnum } from 'class-validator';
import { leadStatusEnum } from '@/db/schema';

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsEnum(leadStatusEnum.enumValues)
  @IsOptional()
  status?: (typeof leadStatusEnum.enumValues)[number];

  @IsInt()
  @IsOptional()
  ownerId?: number;
}
