import { Injectable, Logger } from '@nestjs/common';

export interface DataProcessingActivity {
    id: string;
    name: string;
    purpose: string;
    legalBasis: string;
    dataCategories: string[];
    recipients: string[];
    retentionPeriod: string;
    securityMeasures: string[];
    dataTransfers: string[];
    lastUpdated: Date;
}

@Injectable()
export class DataProcessingRegistryService {
    private readonly logger = new Logger(DataProcessingRegistryService.name);

    /**
     * Registre des traitements de données personnelles
     * Conforme à l'article 30 du RGPD
     */
    private readonly processingActivities: DataProcessingActivity[] = [
        {
            id: 'user-management',
            name: 'Gestion des comptes utilisateurs',
            purpose: 'Création, authentification et gestion des comptes utilisateurs',
            legalBasis: 'Exécution du contrat (création de compte)',
            dataCategories: ['identifiants', 'coordonnées', 'données d\'authentification'],
            recipients: ['équipe support', 'équipe technique'],
            retentionPeriod: '3 ans après dernière activité',
            securityMeasures: ['chiffrement des mots de passe', 'authentification JWT', 'logs d\'audit'],
            dataTransfers: ['aucun transfert hors UE'],
            lastUpdated: new Date('2024-01-01')
        },
        {
            id: 'order-processing',
            name: 'Traitement des commandes',
            purpose: 'Gestion des commandes, facturation et livraison',
            legalBasis: 'Exécution du contrat (achat)',
            dataCategories: ['identifiants', 'coordonnées', 'données de commande', 'adresses de livraison'],
            recipients: ['équipe commerciale', 'équipe logistique', 'prestataires de paiement'],
            retentionPeriod: '10 ans (obligation fiscale)',
            securityMeasures: ['chiffrement des données sensibles', 'accès restreint', 'logs d\'audit'],
            dataTransfers: ['prestataires de paiement (Stripe, PayPal)'],
            lastUpdated: new Date('2024-01-01')
        },
        {
            id: 'customer-support',
            name: 'Service client et support',
            purpose: 'Assistance client, gestion des réclamations',
            legalBasis: 'Intérêt légitime (service client)',
            dataCategories: ['identifiants', 'coordonnées', 'historique des interactions'],
            recipients: ['équipe support', 'équipe technique'],
            retentionPeriod: '5 ans après résolution',
            securityMeasures: ['accès restreint', 'chiffrement des communications'],
            dataTransfers: ['aucun transfert hors UE'],
            lastUpdated: new Date('2024-01-01')
        },
        {
            id: 'marketing-communications',
            name: 'Marketing et communications',
            purpose: 'Envoi de newsletters, promotions, communications marketing',
            legalBasis: 'Consentement explicite',
            dataCategories: ['identifiants', 'coordonnées', 'préférences marketing'],
            recipients: ['équipe marketing', 'prestataires d\'emailing'],
            retentionPeriod: '3 ans après retrait du consentement',
            securityMeasures: ['consentement explicite', 'droit de retrait', 'logs de consentement'],
            dataTransfers: ['prestataires d\'emailing (SendGrid, Mailchimp)'],
            lastUpdated: new Date('2024-01-01')
        },
        {
            id: 'analytics-improvement',
            name: 'Analytics et amélioration du service',
            purpose: 'Analyse d\'usage, amélioration de l\'expérience utilisateur',
            legalBasis: 'Consentement explicite',
            dataCategories: ['données de navigation', 'préférences utilisateur', 'données d\'usage'],
            recipients: ['équipe produit', 'équipe technique'],
            retentionPeriod: '2 ans',
            securityMeasures: ['anonymisation', 'pseudonymisation', 'accès restreint'],
            dataTransfers: ['Google Analytics (avec consentement)'],
            lastUpdated: new Date('2024-01-01')
        },
        {
            id: 'legal-compliance',
            name: 'Conformité légale et fiscale',
            purpose: 'Respect des obligations légales, fiscales et réglementaires',
            legalBasis: 'Obligation légale',
            dataCategories: ['identifiants', 'données de transaction', 'données fiscales'],
            recipients: ['équipe juridique', 'équipe comptable', 'autorités compétentes'],
            retentionPeriod: '10 ans (obligation fiscale)',
            securityMeasures: ['chiffrement', 'accès restreint', 'archivage sécurisé'],
            dataTransfers: ['autorités fiscales (si requis)'],
            lastUpdated: new Date('2024-01-01')
        },
        {
            id: 'security-monitoring',
            name: 'Sécurité et monitoring',
            purpose: 'Détection et prévention des fraudes, sécurité du système',
            legalBasis: 'Intérêt légitime (sécurité)',
            dataCategories: ['logs d\'accès', 'données de connexion', 'données de sécurité'],
            recipients: ['équipe sécurité', 'équipe technique'],
            retentionPeriod: '1 an',
            securityMeasures: ['chiffrement', 'accès restreint', 'monitoring en temps réel'],
            dataTransfers: ['aucun transfert hors UE'],
            lastUpdated: new Date('2024-01-01')
        }
    ];

    /**
     * Récupérer le registre complet des traitements
     */
    async getProcessingRegistry(): Promise<DataProcessingActivity[]> {
        this.logger.log('[DataProcessingRegistry] Récupération du registre des traitements');
        return this.processingActivities.map(activity => ({
            ...activity,
            lastUpdated: activity.lastUpdated
        }));
    }

    /**
     * Récupérer un traitement spécifique par ID
     */
    async getProcessingActivity(id: string): Promise<DataProcessingActivity | null> {
        this.logger.log(`[DataProcessingRegistry] Récupération du traitement ${id}`);
        const activity = this.processingActivities.find(a => a.id === id);
        return activity ? { ...activity, lastUpdated: activity.lastUpdated } : null;
    }

    /**
     * Rechercher des traitements par catégorie de données
     */
    async searchByDataCategory(category: string): Promise<DataProcessingActivity[]> {
        this.logger.log(`[DataProcessingRegistry] Recherche par catégorie: ${category}`);
        return this.processingActivities
            .filter(activity =>
                activity.dataCategories.some(cat =>
                    cat.toLowerCase().includes(category.toLowerCase())
                )
            )
            .map(activity => ({
                ...activity,
                lastUpdated: activity.lastUpdated
            }));
    }

    /**
     * Rechercher des traitements par finalité
     */
    async searchByPurpose(purpose: string): Promise<DataProcessingActivity[]> {
        this.logger.log(`[DataProcessingRegistry] Recherche par finalité: ${purpose}`);
        return this.processingActivities
            .filter(activity =>
                activity.purpose.toLowerCase().includes(purpose.toLowerCase()) ||
                activity.name.toLowerCase().includes(purpose.toLowerCase())
            )
            .map(activity => ({
                ...activity,
                lastUpdated: activity.lastUpdated
            }));
    }

    /**
     * Obtenir un résumé du registre
     */
    async getRegistrySummary(): Promise<{
        totalActivities: number;
        dataCategories: string[];
        recipients: string[];
        retentionPeriods: string[];
        legalBases: string[];
    }> {
        this.logger.log('[DataProcessingRegistry] Génération du résumé du registre');

        const allDataCategories = new Set<string>();
        const allRecipients = new Set<string>();
        const allRetentionPeriods = new Set<string>();
        const allLegalBases = new Set<string>();

        this.processingActivities.forEach(activity => {
            activity.dataCategories.forEach(cat => allDataCategories.add(cat));
            activity.recipients.forEach(rec => allRecipients.add(rec));
            allRetentionPeriods.add(activity.retentionPeriod);
            allLegalBases.add(activity.legalBasis);
        });

        return {
            totalActivities: this.processingActivities.length,
            dataCategories: Array.from(allDataCategories).sort(),
            recipients: Array.from(allRecipients).sort(),
            retentionPeriods: Array.from(allRetentionPeriods).sort(),
            legalBases: Array.from(allLegalBases).sort()
        };
    }

    /**
     * Exporter le registre au format JSON
     */
    async exportRegistry(): Promise<{
        registry: DataProcessingActivity[];
        summary: any;
        exportDate: Date;
        version: string;
    }> {
        this.logger.log('[DataProcessingRegistry] Export du registre');

        const summary = await this.getRegistrySummary();

        return {
            registry: this.processingActivities.map(activity => ({
                ...activity,
                lastUpdated: activity.lastUpdated
            })),
            summary,
            exportDate: new Date(),
            version: '1.0.0'
        };
    }
} 