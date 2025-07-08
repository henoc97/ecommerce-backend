import { Injectable, Inject } from '@nestjs/common';
import { NewsletterSubscriptionPrismaRepository } from '../../infrastructure/impl.repositories/NewsletterSubscriptionPrisma.repository';
import { NewsletterSubscriptionEntity } from '../../domain/entities/NewsletterSubscription.entity';

@Injectable()
export class NewsletterSubscriptionService {
    constructor(
        @Inject(NewsletterSubscriptionPrismaRepository) private readonly repository: NewsletterSubscriptionPrismaRepository,
    ) { }

    async subscribe(email: string, shopId: number): Promise<NewsletterSubscriptionEntity> {
        try {
            return await this.repository.subscribe(email, shopId);
        } catch (error) {
            throw error;
        }
    }
    async unsubscribe(email: string, shopId: number) {
        try {
            return await this.repository.unsubscribe(email, shopId);
        } catch (error) {
            throw error;
        }
    }
    async checkSubscriptionStatus(email: string, shopId: number) {
        try {
            return await this.repository.checkSubscriptionStatus(email, shopId);
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