import { OrderEntity } from "../entities/Order.entity";
import { PaymentEntity } from "../entities/Payment.entity";
import { ProductEntity } from "../entities/Product.entity";
import { RefundEntity } from "../entities/Refund.entity";
import { ReviewEntity } from "../entities/Review.entity";
import { ShopEntity } from "../entities/Shop.entity";
import { ShopSubscriptionEntity } from "../entities/ShopSubscription.entity";
import { SubsiteEntity } from "../entities/Subsite.entity";

export interface IShopRepository {
    createShop(data: ShopEntity): Promise<ShopEntity>;
    updateShop(id: number, data: Partial<ShopEntity>): Promise<ShopEntity>;
    deleteShop(id: number): Promise<void>;
    findById(id: number): Promise<ShopEntity>;
    listShops(filter?: Partial<ShopEntity>): Promise<ShopEntity[]>;
    getShopProducts(shopId: number): Promise<ProductEntity[]>;
    getShopSubsite(shopId: number): Promise<SubsiteEntity>;
    updateShopSubsite(shopId: number, config: Partial<SubsiteEntity>): Promise<SubsiteEntity>;
    subscribeToPlan(shopId: number, subscriptionId: number): Promise<ShopSubscriptionEntity>;
    getShopOrders(shopId: number): Promise<OrderEntity[]>;
    getShopPayments(shopId: number): Promise<PaymentEntity[]>;
    getShopRefunds(shopId: number): Promise<RefundEntity[]>;
    getShopReviews(shopId: number): Promise<ReviewEntity[]>;
} 