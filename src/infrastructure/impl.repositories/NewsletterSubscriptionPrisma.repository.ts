import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client/prisma.service';
import { NewsletterSubscriptionEntity } from '../../domain/entities/NewsletterSubscription.entity';
import { INewsletterSubscriptionRepository } from '../../domain/repositories/NewsletterSubscription.repository';

export class NewsletterSubscriptionPrismaRepository implements INewsletterSubscriptionRepository {

    async subscribe(email: string, shopId: number): Promise<NewsletterSubscriptionEntity> {
        try {
            return await prisma.newsletterSubscription.create({ data: { email, shopId } }) as NewsletterSubscriptionEntity;
        } catch (error) {
            throw error;
        }
    }
    async unsubscribe(email: string, shopId: number): Promise<void> {
        try {
            await prisma.newsletterSubscription.delete({
                where: { email_shopId: { email, shopId } }
            });
        } catch (error) {
            throw error;
        }
    }
    async checkSubscriptionStatus(email: string, shopId: number): Promise<boolean> {
        try {
            const sub = await prisma.newsletterSubscription.findUnique({ where: { email_shopId: { email, shopId } } });
            return !!sub;
        } catch (error) {
            throw error;
        }
    }
    async listSubscribers(shopId: number): Promise<NewsletterSubscriptionEntity[]> {
        try {
            return await prisma.newsletterSubscription.findMany({ where: { shopId } }) as NewsletterSubscriptionEntity[];
        } catch (error) {
            throw error;
        }
    }

    // GDPR - Recherche et suppression par utilisateur
    async findByUserId(userId: number): Promise<NewsletterSubscriptionEntity[]> {
        try {
            // Récupérer l'email de l'utilisateur
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });

            if (!user) return [];

            // Trouver tous les abonnements avec cet email
            return await prisma.newsletterSubscription.findMany({
                where: { email: user.email }
            }) as NewsletterSubscriptionEntity[];
        } catch (error) {
            throw error;
        }
    }

    async deleteByUserId(userId: number): Promise<void> {
        try {
            // Récupérer l'email de l'utilisateur
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });

            if (user) {
                // Supprimer tous les abonnements avec cet email
                await prisma.newsletterSubscription.deleteMany({
                    where: { email: user.email }
                });
            }
        } catch (error) {
            throw error;
        }
    }
} 