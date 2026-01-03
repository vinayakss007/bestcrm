
import { IsString, IsNotEmpty, IsEnum, IsInt } from 'class-validator';
import { assignmentRuleObjectEnum } from '@/db/schema';

export class CreateAssignmentRuleDto {
  @IsEnum(assignmentRuleObjectEnum.enumValues)
  @IsNotEmpty()
  object: (typeof assignmentRuleObjectEnum.enumValues)[number];

  @IsString()
  @IsNotEmpty()
  conditionField: string;

  @IsString()
  @IsNotEmpty()
  conditionValue: string;

  @IsInt()
  @IsNotEmpty()
  assignToId: number;
}
