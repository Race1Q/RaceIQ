import { ApiProperty } from '@nestjs/swagger';

/**
 * Defines the standard shape for all API error responses.
 */
export class ApiErrorDto {
  @ApiProperty({
    example: 404,
    description: 'The HTTP status code.',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Driver with ID 999 not found',
    description: 'A human-readable error message.',
  })
  message: string;

  @ApiProperty({
    example: 'Not Found',
    description: 'A short description of the HTTP status.',
  })
  error: string;
}
