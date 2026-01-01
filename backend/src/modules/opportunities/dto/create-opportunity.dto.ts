
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { OpportunityStageEnum } from '../../../enums';

export class CreateOpportunityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  accountId: number;

  @IsEnum(OpportunityStageEnum)
  @IsOptional()
  stage?: (typeof OpportunityStageEnum)[number];

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
