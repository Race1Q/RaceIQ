import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// This decorator extracts the user payload attached by the Passport strategy
export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
