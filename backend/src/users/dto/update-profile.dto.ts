import { IsString, IsOptional, IsIn, IsNumber } from 'class-validator';

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
}