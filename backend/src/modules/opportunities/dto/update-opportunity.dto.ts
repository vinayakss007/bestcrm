
import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { OpportunityStageEnum } from '../../../enums';

export class UpdateOpportunityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  accountId?: number;

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
