import { ShopEntity } from "./Shop.entity";

export class SubsiteEntity {
    id: number;
    title: string;
    config: any; // JSON field to store subsite configuration
    createdAt: Date;
    shopId: number;
    shop?: ShopEntity;
} 