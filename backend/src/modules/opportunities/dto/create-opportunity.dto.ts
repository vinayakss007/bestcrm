
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { opportunityStageEnum } from '@/db/schema';

export class CreateOpportunityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  accountId: number;

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
