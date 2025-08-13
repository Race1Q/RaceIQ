import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from './scopes.decorator';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = ctx.switchToHttp().getRequest();
    const user = request.user as { permissions?: string[]; scope?: string };

    // Auth0 may put permissions in `permissions[]` (RBAC) OR space-delimited `scope`
    const have = new Set([
      ...(user?.permissions ?? []),
      ...((user?.scope ?? '').split(' ').filter(Boolean)),
    ]);

    return required.every((s) => have.has(s));
  }
}
