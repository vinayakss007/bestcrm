
import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsInt()
  @IsOptional()
  ownerId?: number;
}
