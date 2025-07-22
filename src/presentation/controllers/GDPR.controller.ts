import { Controller, Post, Get, Body, Req, UseGuards, HttpException, HttpStatus, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GDPRService } from '../../application/services/gdpr.service';
import { DataProcessingRegistryService } from '../../application/services/data-processing-registry.service';
import { Roles } from '../../application/helpers/roles.decorator';
import { RolesGuard } from '../../application/helpers/roles.guard';
import { UserRole } from '../../domain/enums/UserRole.enum';
import { IConsentPreferences } from 'src/domain/repositories/User.repository';

@ApiTags('RGPD - Protection des données')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.CLIENT, UserRole.ADMIN)
@Controller('gdpr')
export class GDPRController {
    constructor(
        private readonly gdprService: GDPRService,
        private readonly dataProcessingRegistryService: DataProcessingRegistryService
    ) { }

    @Post('delete-account')
    @ApiOperation({
        summary: 'Droit à l\'oubli - Suppression complète des données',
        description: 'Permet à l\'utilisateur de demander la suppression complète de ses données personnelles conformément au RGPD (droit à l\'oubli).'
    })
    @ApiResponse({
        status: 200,
        description: 'Données supprimées avec succès',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                deletedData: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['newsletter_subscriptions', 'user_activities', 'notifications', 'reviews', 'cart', 'addresses', 'orders_anonymized', 'user']
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiResponse({ status: 500, description: 'Erreur lors de la suppression' })
    async deleteUserData(@Req() req: any) {
        try {
            const userId = req.user.id;
            const result = await this.gdprService.deleteUserData(userId);

            return {
                message: result.message,
                deletedData: result.deletedData,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Erreur lors de la suppression des données',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('export-data')
    @ApiOperation({
        summary: 'Export des données personnelles',
        description: 'Permet à l\'utilisateur d\'exporter toutes ses données personnelles conformément au RGPD (droit d\'accès).'
    })
    @ApiResponse({
        status: 200,
        description: 'Données exportées avec succès',
        schema: {
            type: 'object',
            properties: {
                user: { type: 'object' },
                orders: { type: 'array' },
                cart: { type: 'array' },
                reviews: { type: 'array' },
                notifications: { type: 'array' },
                activities: { type: 'array' },
                newsletterSubscriptions: { type: 'array' },
                addresses: { type: 'array' },
                auditLogs: { type: 'array' },
                exportDate: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
    @ApiResponse({ status: 500, description: 'Erreur lors de l\'export' })
    async exportUserData(@Req() req: any, @Res() res: Response) {
        try {
            const userId = req.user.id;
            const exportData = await this.gdprService.exportUserData(userId);

            // Retourner les données en JSON avec en-têtes appropriés
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="gdpr-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`);

            return res.status(HttpStatus.OK).json(exportData);
        } catch (error) {
            throw new HttpException(
                error.message || 'Erreur lors de l\'export des données',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('consent-preferences')
    @ApiOperation({
        summary: 'Récupérer les préférences de consentement',
        description: 'Récupère les préférences actuelles de consentement de l\'utilisateur pour le traitement des données.'
    })
    @ApiResponse({
        status: 200,
        description: 'Préférences de consentement',
        schema: {
            type: 'object',
            properties: {
                marketing: { type: 'boolean', description: 'Consentement marketing' },
                analytics: { type: 'boolean', description: 'Consentement analytics' },
                necessary: { type: 'boolean', description: 'Consentement nécessaire (toujours true)' },
                preferences: { type: 'boolean', description: 'Consentement préférences' },
                lastUpdated: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
    async getConsentPreferences(@Req() req: any) {
        try {
            const userId = req.user.id;
            const preferences = await this.gdprService.getConsentPreferences(userId);

            return {
                ...preferences,
                lastUpdated: preferences.lastUpdated.toISOString()
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Erreur lors de la récupération des préférences',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('consent-preferences')
    @ApiOperation({
        summary: 'Mettre à jour les préférences de consentement',
        description: 'Permet à l\'utilisateur de mettre à jour ses préférences de consentement pour le traitement des données.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                marketing: { type: 'boolean', description: 'Consentement marketing' },
                analytics: { type: 'boolean', description: 'Consentement analytics' },
                preferences: { type: 'boolean', description: 'Consentement préférences' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Préférences mises à jour',
        schema: {
            type: 'object',
            properties: {
                marketing: { type: 'boolean' },
                analytics: { type: 'boolean' },
                necessary: { type: 'boolean' },
                preferences: { type: 'boolean' },
                lastUpdated: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiResponse({ status: 400, description: 'Données invalides' })
    @ApiResponse({ status: 500, description: 'Erreur lors de la mise à jour' })
    async updateConsentPreferences(
        @Req() req: any,
        @Body() preferences: Partial<IConsentPreferences>
    ) {
        try {
            const userId = req.user.id;
            const updatedPreferences = await this.gdprService.updateConsentPreferences(userId, preferences);

            return {
                ...updatedPreferences,
                lastUpdated: updatedPreferences.lastUpdated.toISOString()
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Erreur lors de la mise à jour des préférences',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('data-processing-info')
    @ApiOperation({
        summary: 'Informations sur le traitement des données',
        description: 'Fournit des informations détaillées sur le traitement des données personnelles conformément au RGPD.'
    })
    @ApiResponse({
        status: 200,
        description: 'Informations sur le traitement des données',
        schema: {
            type: 'object',
            properties: {
                dataController: { type: 'string' },
                purposes: { type: 'array', items: { type: 'string' } },
                retentionPeriods: { type: 'object' },
                userRights: { type: 'array', items: { type: 'string' } },
                contactInfo: { type: 'object' }
            }
        }
    })
    async getDataProcessingInfo() {
        return {
            dataController: 'Votre Entreprise E-commerce',
            purposes: [
                'Gestion des comptes utilisateurs',
                'Traitement des commandes',
                'Service client et support',
                'Marketing et communications (avec consentement)',
                'Analytics et amélioration du service (avec consentement)',
                'Conformité légale et fiscale'
            ],
            retentionPeriods: {
                userAccount: '3 ans après dernière activité',
                orders: '10 ans (obligation fiscale)',
                marketingData: '3 ans après retrait du consentement',
                analytics: '2 ans',
                auditLogs: '5 ans'
            },
            userRights: [
                'Droit d\'accès aux données',
                'Droit de rectification',
                'Droit à l\'effacement (droit à l\'oubli)',
                'Droit à la portabilité',
                'Droit de limitation du traitement',
                'Droit d\'opposition au traitement',
                'Droit de retrait du consentement'
            ],
            contactInfo: {
                email: 'dpo@votreentreprise.com',
                address: '123 Rue de la Protection, 75001 Paris, France',
                phone: '+33 1 23 45 67 89'
            },
            lastUpdated: new Date().toISOString()
        };
    }

    @Get('processing-registry')
    @ApiOperation({
        summary: 'Registre des traitements de données',
        description: 'Récupère le registre complet des traitements de données personnelles conformément à l\'article 30 du RGPD.'
    })
    @ApiResponse({
        status: 200,
        description: 'Registre des traitements',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    purpose: { type: 'string' },
                    legalBasis: { type: 'string' },
                    dataCategories: { type: 'array', items: { type: 'string' } },
                    recipients: { type: 'array', items: { type: 'string' } },
                    retentionPeriod: { type: 'string' },
                    securityMeasures: { type: 'array', items: { type: 'string' } },
                    dataTransfers: { type: 'array', items: { type: 'string' } },
                    lastUpdated: { type: 'string', format: 'date-time' }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async getProcessingRegistry() {
        try {
            const registry = await this.dataProcessingRegistryService.getProcessingRegistry();
            return registry.map(activity => ({
                ...activity,
                lastUpdated: activity.lastUpdated.toISOString()
            }));
        } catch (error) {
            throw new HttpException(
                'Erreur lors de la récupération du registre',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('processing-registry/summary')
    @ApiOperation({
        summary: 'Résumé du registre des traitements',
        description: 'Récupère un résumé statistique du registre des traitements.'
    })
    @ApiResponse({
        status: 200,
        description: 'Résumé du registre',
        schema: {
            type: 'object',
            properties: {
                totalActivities: { type: 'number' },
                dataCategories: { type: 'array', items: { type: 'string' } },
                recipients: { type: 'array', items: { type: 'string' } },
                retentionPeriods: { type: 'array', items: { type: 'string' } },
                legalBases: { type: 'array', items: { type: 'string' } }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async getRegistrySummary() {
        try {
            return await this.dataProcessingRegistryService.getRegistrySummary();
        } catch (error) {
            throw new HttpException(
                'Erreur lors de la récupération du résumé',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('processing-registry/search')
    @ApiOperation({
        summary: 'Rechercher dans le registre des traitements',
        description: 'Recherche des traitements par catégorie de données ou finalité.'
    })
    @ApiQuery({
        name: 'category',
        required: false,
        description: 'Catégorie de données à rechercher',
        example: 'identifiants'
    })
    @ApiQuery({
        name: 'purpose',
        required: false,
        description: 'Finalité à rechercher',
        example: 'marketing'
    })
    @ApiResponse({
        status: 200,
        description: 'Résultats de la recherche',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    purpose: { type: 'string' },
                    legalBasis: { type: 'string' },
                    dataCategories: { type: 'array', items: { type: 'string' } },
                    recipients: { type: 'array', items: { type: 'string' } },
                    retentionPeriod: { type: 'string' },
                    securityMeasures: { type: 'array', items: { type: 'string' } },
                    dataTransfers: { type: 'array', items: { type: 'string' } },
                    lastUpdated: { type: 'string', format: 'date-time' }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async searchProcessingRegistry(
        @Query('category') category?: string,
        @Query('purpose') purpose?: string
    ) {
        try {
            let results = [];

            if (category) {
                results = await this.dataProcessingRegistryService.searchByDataCategory(category);
            } else if (purpose) {
                results = await this.dataProcessingRegistryService.searchByPurpose(purpose);
            } else {
                results = await this.dataProcessingRegistryService.getProcessingRegistry();
            }

            return results.map(activity => ({
                ...activity,
                lastUpdated: activity.lastUpdated.toISOString()
            }));
        } catch (error) {
            throw new HttpException(
                'Erreur lors de la recherche dans le registre',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('processing-registry/export')
    @ApiOperation({
        summary: 'Exporter le registre des traitements',
        description: 'Exporte le registre complet des traitements au format JSON.'
    })
    @ApiResponse({
        status: 200,
        description: 'Registre exporté',
        schema: {
            type: 'object',
            properties: {
                registry: { type: 'array' },
                summary: { type: 'object' },
                exportDate: { type: 'string', format: 'date-time' },
                version: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async exportProcessingRegistry(@Res() res: Response) {
        try {
            const exportData = await this.dataProcessingRegistryService.exportRegistry();

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="data-processing-registry-${new Date().toISOString().split('T')[0]}.json"`);

            return res.status(HttpStatus.OK).json({
                ...exportData,
                exportDate: exportData.exportDate.toISOString(),
                registry: exportData.registry.map(activity => ({
                    ...activity,
                    lastUpdated: activity.lastUpdated.toISOString()
                }))
            });
        } catch (error) {
            throw new HttpException(
                'Erreur lors de l\'export du registre',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
} 