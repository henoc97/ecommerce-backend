import { CartEntity } from "./Cart.entity";
import { CategoryEntity } from "./Category.entity";
import { NewsletterSubscriptionEntity } from "./NewsletterSubscription.entity";
import { OrderEntity } from "./Order.entity";
import { ProductEntity } from "./Product.entity";
import { ShopSubscriptionEntity } from "./ShopSubscription.entity";
import { SubsiteEntity } from "./Subsite.entity";
import { VendorEntity } from "./Vendor.entity";

export class ShopEntity {
    id: number;
    name: string;
    url?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    vendorId: number;
    subsiteId?: number;
    vendor?: VendorEntity;
    subsite?: SubsiteEntity;
    shopSubscriptions?: ShopSubscriptionEntity[];
    carts?: CartEntity[];
    products?: ProductEntity[];
    orders?: OrderEntity[];
    categories?: CategoryEntity[];
    newsletterSubscriptions?: NewsletterSubscriptionEntity[];
} 