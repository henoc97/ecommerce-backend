import { Currency } from "../enums/Currency.enum";
import { ShopSubscriptionEntity } from "./ShopSubscription.entity";

export class SubscriptionEntity {
    id: number;
    name: string;
    description?: string;
    price: number = 0;
    currency: Currency;
    duration: number; // Duration in days or months
    createdAt: Date;
    updatedAt: Date;
    shopSubscriptions?: ShopSubscriptionEntity[];
} 