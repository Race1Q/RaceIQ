import { IsString, IsOptional, IsIn, IsNumber, IsBoolean } from 'class-validator';

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
}