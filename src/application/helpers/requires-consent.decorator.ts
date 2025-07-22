import { SetMetadata } from '@nestjs/common';

export const REQUIRES_CONSENT_KEY = 'requiresConsent';
export type ConsentType = 'marketing' | 'analytics' | 'preferences';

export const RequiresConsent = (type: ConsentType) =>
    SetMetadata(REQUIRES_CONSENT_KEY, type); 