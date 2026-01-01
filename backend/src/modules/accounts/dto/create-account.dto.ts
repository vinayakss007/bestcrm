
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsInt()
  @IsOptional()
  ownerId?: number;
}
