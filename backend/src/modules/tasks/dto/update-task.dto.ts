
import { IsString, IsDateString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { TaskStatusEnum, RelatedToTypeEnum } from '../../../enums';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(TaskStatusEnum)
  @IsOptional()
  status?: (typeof TaskStatusEnum)[number];

  @IsInt()
  @IsOptional()
  assignedToId?: number;

  @IsEnum(RelatedToTypeEnum)
  @IsOptional()
  relatedToType?: (typeof RelatedToTypeEnum)[number];

  @IsInt()
  @IsOptional()
  relatedToId?: number;
}
