import { NewsletterSubscriptionEntity } from "../entities/NewsletterSubscription.entity";

export interface INewsletterSubscriptionRepository {
    subscribe(userId: number, shopId: number): Promise<NewsletterSubscriptionEntity>;
    unsubscribe(userId: number, shopId: number): Promise<void>;
    checkSubscriptionStatus(userId: number, shopId: number): Promise<boolean>;
    listSubscribers(shopId: number): Promise<NewsletterSubscriptionEntity[]>;
} 