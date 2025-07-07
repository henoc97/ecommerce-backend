import { ShopSubscriptionEntity } from "../entities/ShopSubscription.entity";

export interface IShopSubscriptionRepository {
    subscribe(shopId: number, subscriptionId: number): Promise<ShopSubscriptionEntity>;
    getActiveSubscriptions(): Promise<ShopSubscriptionEntity[]>;
    getExpiredSubscriptions(): Promise<ShopSubscriptionEntity[]>;
    getShopSubscriptions(shopId: number): Promise<ShopSubscriptionEntity[]>;
} 