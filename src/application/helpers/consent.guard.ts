import {
    Injectable, CanActivate, ExecutionContext, ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GDPRService } from '../services/gdpr.service';
import { REQUIRES_CONSENT_KEY, ConsentType } from './requires-consent.decorator';

@Injectable()
export class ConsentGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private gdprService: GDPRService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const consentType = this.reflector.get<ConsentType>(REQUIRES_CONSENT_KEY, context.getHandler());
        if (!consentType) return true; // Pas de consentement requis

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.id) throw new ForbiddenException('Utilisateur non authentifié');

        const preferences = await this.gdprService.getConsentPreferences(user.id);
        if (!preferences[consentType]) {
            throw new ForbiddenException(`Consentement ${consentType} requis`);
        }
        return true;
    }
} 