
import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { opportunityStageEnum } from '@/db/schema';

export class UpdateOpportunityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  accountId?: number;

  @IsEnum(opportunityStageEnum.enumValues)
  @IsOptional()
  stage?: (typeof opportunityStageEnum.enumValues)[number];

  @IsInt()
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  closeDate?: string;

  @IsInt()
  @IsOptional()
  ownerId?: number;
}
