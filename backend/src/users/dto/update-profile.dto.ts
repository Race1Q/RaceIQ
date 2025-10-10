import { IsString, IsOptional, IsIn, IsNumber, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsNumber()
  favorite_driver_id?: number;

  @IsOptional()
  @IsNumber()
  favorite_constructor_id?: number;

  @IsOptional()
  @IsIn(['dark', 'light'])
  theme_preference?: 'dark' | 'light';

  @IsOptional()
  @IsBoolean()
  use_custom_team_color?: boolean;

  @IsOptional()
  @IsObject()
  dashboard_visibility?: object;

  @IsOptional()
  @IsObject()
  dashboard_layouts?: object;
}