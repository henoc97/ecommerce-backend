import prisma from '../../../prisma/client/prisma.service';
import { NewsletterSubscriptionEntity } from '../../domain/entities/NewsletterSubscription.entity';
import { INewsletterSubscriptionRepository } from '../../domain/repositories/NewsletterSubscription.repository';

export class NewsletterSubscriptionPrismaRepository implements INewsletterSubscriptionRepository {
    async subscribe(userId: number, shopId: number): Promise<NewsletterSubscriptionEntity> {
        try {
            return await prisma.newsletterSubscription.create({ data: { userId, shopId } }) as NewsletterSubscriptionEntity;
        } catch (error) {
            throw error;
        }
    }
    async unsubscribe(userId: number, shopId: number): Promise<void> {
        try {
            await prisma.newsletterSubscription.delete({ where: { userId_shopId: { userId, shopId } } });
        } catch (error) {
            throw error;
        }
    }
    async checkSubscriptionStatus(userId: number, shopId: number): Promise<boolean> {
        try {
            const sub = await prisma.newsletterSubscription.findUnique({ where: { userId_shopId: { userId, shopId } } });
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
} 