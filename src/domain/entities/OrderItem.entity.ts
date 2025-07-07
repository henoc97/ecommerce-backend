import { OrderEntity } from "./Order.entity";
import { ProductVariantEntity } from "./ProductVariant.entity";

export class OrderItemEntity {
    id: number;
    orderId: number;
    productVariantId: number;
    quantity: number = 1;
    price: number = 0;
    createdAt: Date;
    updatedAt: Date;
    order?: OrderEntity;
    productVariant?: ProductVariantEntity;
} 