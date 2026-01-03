
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './permissions.decorator';
import { AuthenticatedUser } from '../users/users.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermission) {
      return true; // No permission is required, access is granted
    }
    
    const { user }: { user: AuthenticatedUser } = context.switchToHttp().getRequest();
    
    if (!user || !user.role || !user.role.permissions) {
      throw new ForbiddenException('You do not have the necessary permissions to perform this action.');
    }

    const hasPermission = user.role.permissions.some(
      (p) => p.permission.key === requiredPermission
    );

    if (!hasPermission) {
        throw new ForbiddenException('You do not have the necessary permissions to perform this action.');
    }

    return true;
  }
}
