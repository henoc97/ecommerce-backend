import { ShopEntity } from "./Shop.entity";
import { SubscriptionEntity } from "./Subscription.entity";

export class ShopSubscriptionEntity {
    id: number;
    shopId: number;
    subscriptionId: number;
    startDate: Date;
    endDate?: Date;
    shop?: ShopEntity;
    subscription?: SubscriptionEntity;
} 