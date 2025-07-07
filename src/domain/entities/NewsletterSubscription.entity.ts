import { ShopEntity } from "./Shop.entity";

export class NewsletterSubscriptionEntity {
    id: number;
    email: string;
    subscribedAt: Date;
    isActive: boolean;
    shopId: number;
    shop?: ShopEntity;
}