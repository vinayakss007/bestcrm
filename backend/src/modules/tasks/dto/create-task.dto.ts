
import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { taskStatusEnum, relatedToTypeEnum } from '@/db/schema';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsEnum(taskStatusEnum.enumValues)
  @IsOptional()
  status?: (typeof taskStatusEnum.enumValues)[number];

  @IsInt()
  @IsNotEmpty()
  assignedToId: number;

  @IsEnum(relatedToTypeEnum.enumValues)
  @IsOptional()
  relatedToType?: (typeof relatedToTypeEnum.enumValues)[number];

  @IsInt()
  @IsOptional()
  relatedToId?: number;
}
