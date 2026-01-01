
import { IsString, IsOptional } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  name?: string;

  // Add other updatable fields here in the future, like brand colors, logo URL, etc.
}
