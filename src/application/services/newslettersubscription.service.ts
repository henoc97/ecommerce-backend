import { Injectable, Inject } from '@nestjs/common';
import { NewsletterSubscriptionPrismaRepository } from '../../infrastructure/impl.repositories/NewsletterSubscriptionPrisma.repository';
import { NewsletterSubscriptionEntity } from '../../domain/entities/NewsletterSubscription.entity';

@Injectable()
export class NewsletterSubscriptionService {
    constructor(
        @Inject(NewsletterSubscriptionPrismaRepository) private readonly repository: NewsletterSubscriptionPrismaRepository,
    ) { }

    async subscribe(userId: number, shopId: number): Promise<NewsletterSubscriptionEntity> {
        try {
            return await this.repository.subscribe(userId, shopId);
        } catch (error) {
            throw error;
        }
    }
    async unsubscribe(userId: number, shopId: number) {
        try {
            return await this.repository.unsubscribe(userId, shopId);
        } catch (error) {
            throw error;
        }
    }
    async checkSubscriptionStatus(userId: number, shopId: number) {
        try {
            return await this.repository.checkSubscriptionStatus(userId, shopId);
        } catch (error) {
            throw error;
        }
    }
    async listSubscribers(shopId: number) {
        try {
            return await this.repository.listSubscribers(shopId);
        } catch (error) {
            throw error;
        }
    }
} 