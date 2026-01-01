
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  @IsNotEmpty()
  accountId: number;
}
