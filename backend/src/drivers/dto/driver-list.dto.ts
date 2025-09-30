import { ApiProperty } from '@nestjs/swagger';

export class DriverListDto {
  @ApiProperty()
  id: number;
  @ApiProperty({ required: false })
  driver_number?: number;
  @ApiProperty({ required: false })
  first_name?: string;
  @ApiProperty({ required: false })
  last_name?: string;
  @ApiProperty({ required: false })
  name_acronym?: string;
  @ApiProperty({ required: false })
  country_code?: string;
  @ApiProperty({ required: false, description: 'Profile image URL' })
  profile_image_url?: string;
}
