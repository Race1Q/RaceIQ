import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';
import { QueryFailedError } from 'typeorm';
import { ErrorResponse } from '../dto/error-response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Default values
    let status = 500;
    let error = 'Internal Server Error';
    let message = 'An unexpected error occurred';
    let code: string | undefined;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        message = res.message || message;
        error = res.error || errorFromStatus(status) || error;
        // Validation errors often come as an array of strings
        if (Array.isArray(res.message)) {
          details = normalizeValidationMessages(res.message);
          message = 'Validation failed';
          error = 'Bad Request';
        }
      }

      if (exception instanceof BadRequestException) {
        error = 'Bad Request';
      } else if (exception instanceof UnauthorizedException) {
        error = 'Unauthorized';
      } else if (exception instanceof ForbiddenException) {
        error = 'Forbidden';
      } else if (exception instanceof NotFoundException) {
        error = 'Not Found';
      } else if (exception instanceof ThrottlerException) {
        error = 'Too Many Requests';
        message = 'Request limit exceeded. Please try again later.';
      }
    } else if (exception instanceof QueryFailedError) {
      status = 500;
      error = 'Database Error';
      message = 'A database error occurred.';
      code = (exception as any).code;
      details = { detail: (exception as any).detail };
    } else if (exception instanceof Error) {
      // Generic error
      message = exception.message || message;
    }

    const payload: ErrorResponse = {
      statusCode: status,
      error,
      message,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
    };

    response.status(status).json(payload);
  }
}

function errorFromStatus(status: number): string | undefined {
  const map: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };
  return map[status];
}

function normalizeValidationMessages(messages: any[]): any[] {
  // If already objects return as-is
  if (messages.length && typeof messages[0] === 'object') return messages;
  // Otherwise wrap strings
  return messages.map((m) => ({ message: m }));
}
