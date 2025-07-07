import { SubscriptionEntity } from "../entities/Subscription.entity";

export interface ISubscriptionRepository {
    createSubscription(data: SubscriptionEntity): Promise<SubscriptionEntity>;
    updateSubscription(id: number, data: Partial<SubscriptionEntity>): Promise<SubscriptionEntity>;
    deleteSubscription(id: number): Promise<void>;
    findById(id: number): Promise<SubscriptionEntity>;
    listSubscriptions(): Promise<SubscriptionEntity[]>;
    getShopSubscriptions(shopId: number): Promise<SubscriptionEntity[]>;
} 