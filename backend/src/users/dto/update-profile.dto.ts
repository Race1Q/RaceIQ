// backend/src/users/dto/update-profile.dto.ts

import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @Length(3, 30)
  @IsOptional()
  username?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  favorite_constructor_id?: number | null;

  @IsInt()
  @IsOptional()
  @Min(1)
  favorite_driver_id?: number | null;
}