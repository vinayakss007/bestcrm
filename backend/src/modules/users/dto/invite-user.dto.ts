
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { userRoleEnum } from '@/db/schema';


export class InviteUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsEnum(userRoleEnum.enumValues)
  @IsNotEmpty()
  role: 'user' | 'company-admin';
}
