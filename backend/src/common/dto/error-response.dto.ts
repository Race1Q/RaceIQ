import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({ description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ description: 'HTTP error phrase e.g., Bad Request' })
  error: string;

  @ApiProperty({ description: 'Human friendly description of the error' })
  message: string;

  @ApiProperty({ required: false, description: 'Optional application specific error code' })
  code?: string;

  @ApiProperty({ required: false, description: 'Additional structured details (e.g. validation errors)' })
  details?: any;
}
