
import { IsString, IsDateString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { taskStatusEnum, relatedToTypeEnum } from '@/db/schema';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(taskStatusEnum.enumValues)
  @IsOptional()
  status?: (typeof taskStatusEnum.enumValues)[number];

  @IsInt()
  @IsOptional()
  assignedToId?: number;

  @IsEnum(relatedToTypeEnum.enumValues)
  @IsOptional()
  relatedToType?: (typeof relatedToTypeEnum.enumValues)[number];

  @IsInt()
  @IsOptional()
  relatedToId?: number;
}
