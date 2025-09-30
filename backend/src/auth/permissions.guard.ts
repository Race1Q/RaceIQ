// backend/src/auth/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions) {
      return true; // No permissions required, access granted
    }
    const { user } = context.switchToHttp().getRequest();
    const userPermissions = user?.permissions || [];
    
    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  }
}
