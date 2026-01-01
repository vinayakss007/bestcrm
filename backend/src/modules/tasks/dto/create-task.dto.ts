
import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { TaskStatusEnum, RelatedToTypeEnum } from '../../../enums';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsEnum(TaskStatusEnum)
  @IsOptional()
  status?: (typeof TaskStatusEnum)[number];

  @IsInt()
  @IsNotEmpty()
  assignedToId: number;

  @IsEnum(RelatedToTypeEnum)
  @IsOptional()
  relatedToType?: (typeof RelatedToTypeEnum)[number];

  @IsInt()
  @IsOptional()
  relatedToId?: number;
}
