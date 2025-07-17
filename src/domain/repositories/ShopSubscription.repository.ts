import { ShopSubscriptionEntity } from "../entities/ShopSubscription.entity";

export interface IShopSubscriptionRepository {
    subscribe(shopId: number, subscriptionId: number, startDate?: Date, endDate?: Date): Promise<ShopSubscriptionEntity>;
    getActiveSubscriptions(): Promise<ShopSubscriptionEntity[]>;
    getExpiredSubscriptions(): Promise<ShopSubscriptionEntity[]>;
    getShopSubscriptions(shopId: number): Promise<ShopSubscriptionEntity[]>;
} 