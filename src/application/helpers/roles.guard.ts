import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from 'src/domain/enums/UserRole.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // Pas de restriction de rôle
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            throw new ForbiddenException('Utilisateur non authentifié ou rôle manquant');
        }
        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Accès interdit : rôle insuffisant');
        }
        return true;
    }
} 