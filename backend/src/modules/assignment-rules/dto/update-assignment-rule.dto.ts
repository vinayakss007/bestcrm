
import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateAssignmentRuleDto {
  @IsString()
  @IsOptional()
  conditionField?: string;

  @IsString()
  @IsOptional()
  conditionValue?: string;

  @IsInt()
  @IsOptional()
  assignToId?: number;
}
