import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { OrderService } from './order.service';
import { CartService } from './cart.service';
import { ReviewService } from './review.service';
import { NotificationService } from './notification.service';
import { UserActivityService } from './useractivity.service';
import { NewsletterSubscriptionService } from './newslettersubscription.service';
import { AddressService } from './address.service';
import { AuditLogService } from './auditlog.service';
import { IConsentPreferences } from '../../domain/repositories/User.repository';

export interface GDPRDataExport {
    user: any;
    orders: any[];
    cart: any[];
    reviews: any[];
    notifications: any[];
    activities: any[];
    newsletterSubscriptions: any[];
    addresses: any[];
    auditLogs: any[];
    exportDate: Date;
}

@Injectable()
export class GDPRService {
    private readonly logger = new Logger(GDPRService.name);

    constructor(
        private readonly userService: UserService,
        private readonly orderService: OrderService,
        private readonly cartService: CartService,
        private readonly reviewService: ReviewService,
        private readonly notificationService: NotificationService,
        private readonly userActivityService: UserActivityService,
        private readonly newsletterSubscriptionService: NewsletterSubscriptionService,
        private readonly addressService: AddressService,
        private readonly auditLogService: AuditLogService,
    ) { }

    /**
     * Droit à l'oubli - Suppression complète des données utilisateur
     */
    async deleteUserData(userId: number): Promise<{ message: string; deletedData: string[] }> {
        this.logger.log(`[GDPR] Demande de suppression des données pour l'utilisateur ${userId}`);

        try {
            const deletedData: string[] = [];

            // 1. Supprimer les abonnements newsletter
            try {
                await this.newsletterSubscriptionService.deleteByUserId(userId);
                deletedData.push('newsletter_subscriptions');
            } catch (error) {
                this.logger.warn(`Erreur lors de la suppression des abonnements newsletter: ${error.message}`);
            }

            // 2. Supprimer les activités utilisateur
            try {
                await this.userActivityService.deleteByUserId(userId);
                deletedData.push('user_activities');
            } catch (error) {
                this.logger.warn(`Erreur lors de la suppression des activités: ${error.message}`);
            }

            // 3. Supprimer les notifications
            try {
                await this.notificationService.deleteByUserId(userId);
                deletedData.push('notifications');
            } catch (error) {
                this.logger.warn(`Erreur lors de la suppression des notifications: ${error.message}`);
            }

            // 4. Supprimer les avis
            try {
                await this.reviewService.deleteByUserId(userId);
                deletedData.push('reviews');
            } catch (error) {
                this.logger.warn(`Erreur lors de la suppression des avis: ${error.message}`);
            }

            // 5. Supprimer le panier
            try {
                await this.cartService.deleteByUserId(userId);
                deletedData.push('cart');
            } catch (error) {
                this.logger.warn(`Erreur lors de la suppression du panier: ${error.message}`);
            }

            // 6. Supprimer les adresses
            try {
                await this.addressService.deleteByUserId(userId);
                deletedData.push('addresses');
            } catch (error) {
                this.logger.warn(`Erreur lors de la suppression des adresses: ${error.message}`);
            }

            // 7. Anonymiser les commandes (garder pour la comptabilité mais anonymiser)
            try {
                await this.orderService.anonymizeByUserId(userId);
                deletedData.push('orders_anonymized');
            } catch (error) {
                this.logger.warn(`Erreur lors de l'anonymisation des commandes: ${error.message}`);
            }

            // 8. Supprimer l'utilisateur (dernière étape)
            try {
                await this.userService.deleteUser(userId);
                deletedData.push('user');
            } catch (error) {
                this.logger.warn(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
            }

            // 9. Logger l'action d'audit
            try {
                await this.auditLogService.logAction({
                    userId: null, // Utilisateur supprimé
                    action: 'GDPR_DELETION',
                    entity: 'User',
                    entityId: userId,
                    changes: { deletedData },
                } as any);
            } catch (error) {
                this.logger.warn(`Erreur lors du logging d'audit: ${error.message}`);
            }

            this.logger.log(`[GDPR] Suppression terminée pour l'utilisateur ${userId}`, { deletedData });

            return {
                message: 'Données utilisateur supprimées conformément au RGPD',
                deletedData
            };
        } catch (error) {
            this.logger.error(`[GDPR] Erreur lors de la suppression des données: ${error.message}`);
            throw new HttpException(
                'Erreur lors de la suppression des données personnelles',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Export des données personnelles
     */
    async exportUserData(userId: number): Promise<GDPRDataExport> {
        this.logger.log(`[GDPR] Demande d'export des données pour l'utilisateur ${userId}`);

        try {
            // Récupérer toutes les données de l'utilisateur
            const user = await this.userService.findById(userId);
            if (!user) {
                throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
            }

            const [
                orders,
                cart,
                reviews,
                notifications,
                activities,
                newsletterSubscriptions,
                addresses,
                auditLogs
            ] = await Promise.all([
                this.orderService.findByUserId(userId),
                this.cartService.findByUserId(userId),
                this.reviewService.findByUserId(userId),
                this.notificationService.findByUserId(userId),
                this.userActivityService.findByUserId(userId),
                this.newsletterSubscriptionService.findByUserId(userId),
                this.addressService.findAllAddresses(userId),
                this.auditLogService.findByUserId(userId)
            ]);

            const exportData: GDPRDataExport = {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    // Ne pas inclure le mot de passe hashé
                },
                orders: orders || [],
                cart: cart || [],
                reviews: reviews || [],
                notifications: notifications || [],
                activities: activities || [],
                newsletterSubscriptions: newsletterSubscriptions || [],
                addresses: addresses || [],
                auditLogs: auditLogs || [],
                exportDate: new Date()
            };

            // Logger l'action d'audit
            await this.auditLogService.logAction({
                userId,
                action: 'GDPR_EXPORT',
                entity: 'User',
                entityId: userId,
                changes: { exportDate: exportData.exportDate },
            } as any);

            this.logger.log(`[GDPR] Export terminé pour l'utilisateur ${userId}`);

            return exportData;
        } catch (error) {
            this.logger.error(`[GDPR] Erreur lors de l'export des données: ${error.message}`);
            throw new HttpException(
                'Erreur lors de l\'export des données personnelles',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Mettre à jour les préférences de consentement
     */
    async updateConsentPreferences(
        userId: number,
        preferences: Partial<IConsentPreferences>
    ): Promise<IConsentPreferences> {
        this.logger.log(`[GDPR] Mise à jour des préférences de consentement pour l'utilisateur ${userId}`);

        try {
            const user = await this.userService.findById(userId);
            if (!user) {
                throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
            }

            // Mettre à jour les préférences de consentement
            const updatedPreferences: IConsentPreferences = {
                marketing: preferences.marketing ?? true,
                analytics: preferences.analytics ?? true,
                necessary: true, // Toujours nécessaire
                preferences: preferences.preferences ?? true,
                lastUpdated: new Date()
            };

            // Sauvegarder dans la base de données via le service utilisateur
            await this.userService.updateConsentPreferences(userId, updatedPreferences);

            // Logger l'action d'audit
            await this.auditLogService.logAction({
                userId,
                action: 'CONSENT_UPDATE',
                entity: 'User',
                entityId: userId,
                changes: { consentPreferences: updatedPreferences },
            } as any);

            this.logger.log(`[GDPR] Préférences de consentement mises à jour pour l'utilisateur ${userId}`);

            return updatedPreferences;
        } catch (error) {
            this.logger.error(`[GDPR] Erreur lors de la mise à jour des préférences: ${error.message}`);
            throw new HttpException(
                'Erreur lors de la mise à jour des préférences de consentement',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Récupérer les préférences de consentement actuelles
     */
    async getConsentPreferences(userId: number): Promise<IConsentPreferences> {
        try {
            const user = await this.userService.findById(userId);
            if (!user) {
                throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
            }

            const preferences = await this.userService.getConsentPreferences(userId);

            return preferences || {
                marketing: true,
                analytics: true,
                necessary: true,
                preferences: true,
                lastUpdated: new Date()
            };
        } catch (error) {
            this.logger.error(`[GDPR] Erreur lors de la récupération des préférences: ${error.message}`);
            throw new HttpException(
                'Erreur lors de la récupération des préférences de consentement',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
} 