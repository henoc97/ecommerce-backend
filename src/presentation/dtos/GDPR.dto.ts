import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsDateString } from 'class-validator';

export class ConsentPreferencesDto {
    @ApiProperty({
        description: 'Consentement pour les communications marketing',
        example: true,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    marketing?: boolean;

    @ApiProperty({
        description: 'Consentement pour les analytics et amélioration du service',
        example: true,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    analytics?: boolean;

    @ApiProperty({
        description: 'Consentement pour les préférences personnalisées',
        example: true,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    preferences?: boolean;
}

export class GDPRDataExportDto {
    @ApiProperty({
        description: 'Données utilisateur',
        type: 'object',
        additionalProperties: true
    })
    user: any;

    @ApiProperty({
        description: 'Commandes de l\'utilisateur',
        type: 'array'
    })
    orders: any[];

    @ApiProperty({
        description: 'Panier de l\'utilisateur',
        type: 'array'
    })
    cart: any[];

    @ApiProperty({
        description: 'Avis de l\'utilisateur',
        type: 'array'
    })
    reviews: any[];

    @ApiProperty({
        description: 'Notifications de l\'utilisateur',
        type: 'array'
    })
    notifications: any[];

    @ApiProperty({
        description: 'Activités de l\'utilisateur',
        type: 'array'
    })
    activities: any[];

    @ApiProperty({
        description: 'Abonnements newsletter de l\'utilisateur',
        type: 'array'
    })
    newsletterSubscriptions: any[];

    @ApiProperty({
        description: 'Adresses de l\'utilisateur',
        type: 'array'
    })
    addresses: any[];

    @ApiProperty({
        description: 'Logs d\'audit de l\'utilisateur',
        type: 'array'
    })
    auditLogs: any[];

    @ApiProperty({
        description: 'Date d\'export',
        type: 'string',
        format: 'date-time'
    })
    @IsDateString()
    exportDate: Date;
}

export class GDPRDeletionResponseDto {
    @ApiProperty({
        description: 'Message de confirmation',
        example: 'Données utilisateur supprimées conformément au RGPD'
    })
    @IsString()
    message: string;

    @ApiProperty({
        description: 'Liste des types de données supprimées',
        type: 'array',
        items: { type: 'string' },
        example: ['newsletter_subscriptions', 'user_activities', 'notifications', 'reviews', 'cart', 'addresses', 'orders_anonymized', 'user']
    })
    deletedData: string[];

    @ApiProperty({
        description: 'Horodatage de la suppression',
        type: 'string',
        format: 'date-time'
    })
    @IsDateString()
    timestamp: string;
}

export class DataProcessingInfoDto {
    @ApiProperty({
        description: 'Responsable du traitement des données',
        example: 'Votre Entreprise E-commerce'
    })
    @IsString()
    dataController: string;

    @ApiProperty({
        description: 'Finalités du traitement des données',
        type: 'array',
        items: { type: 'string' },
        example: [
            'Gestion des comptes utilisateurs',
            'Traitement des commandes',
            'Service client et support',
            'Marketing et communications (avec consentement)',
            'Analytics et amélioration du service (avec consentement)',
            'Conformité légale et fiscale'
        ]
    })
    purposes: string[];

    @ApiProperty({
        description: 'Durées de conservation des données',
        type: 'object',
        example: {
            userAccount: '2 ans',
            orders: '5 ans',
            marketingData: '3 ans',
            analytics: '13 mois',
            auditLogs: '6 ans'
        },
        additionalProperties: true
    })
    retentionPeriods: Record<string, string>;

    @ApiProperty({
        description: 'Droits des utilisateurs',
        type: 'array',
        items: { type: 'string' },
        example: [
            'Droit d\'accès aux données',
            'Droit de rectification',
            'Droit à l\'effacement (droit à l\'oubli)',
            'Droit à la portabilité',
            'Droit de limitation du traitement',
            'Droit d\'opposition au traitement',
            'Droit de retrait du consentement'
        ]
    })
    userRights: string[];

    @ApiProperty({
        description: 'Informations de contact du DPO',
        type: 'object',
        example: {
            email: 'dpo@exemple.com',
            address: '10 rue de la Paix',
            phone: '+33612345678'
        },
        additionalProperties: true
    })
    contactInfo: {
        email: string;
        address: string;
        phone: string;
    };

    @ApiProperty({
        description: 'Date de dernière mise à jour',
        type: 'string',
        format: 'date-time'
    })
    @IsDateString()
    lastUpdated: string;
} 