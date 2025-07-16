import { NewsletterSubscriptionEntity } from "../entities/NewsletterSubscription.entity";

export interface INewsletterSubscriptionRepository {
    subscribe(email: string, shopId: number): Promise<NewsletterSubscriptionEntity>;
    unsubscribe(email: string, shopId: number): Promise<void>;
    checkSubscriptionStatus(email: string, shopId: number): Promise<boolean>;
    listSubscribers(shopId: number): Promise<NewsletterSubscriptionEntity[]>;
    listActiveSubscribers(shopId: number): Promise<NewsletterSubscriptionEntity[]>;
} 