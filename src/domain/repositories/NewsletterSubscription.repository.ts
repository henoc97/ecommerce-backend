import { NewsletterSubscriptionEntity } from "../entities/NewsletterSubscription.entity";

export interface INewsletterSubscriptionRepository {
    subscribe(email: string, shopId: number): Promise<NewsletterSubscriptionEntity>;
    unsubscribe(email: string, shopId: number): Promise<void>;
    checkSubscriptionStatus(email: string, shopId: number): Promise<boolean>;
    listSubscribers(shopId: number): Promise<NewsletterSubscriptionEntity[]>;
    // GDPR - Recherche et suppression par utilisateur
    findByUserId(userId: number): Promise<NewsletterSubscriptionEntity[]>;
    deleteByUserId(userId: number): Promise<void>;
} 