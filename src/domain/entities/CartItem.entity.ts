import { CartEntity } from "./Cart.entity";
import { ProductVariantEntity } from "./ProductVariant.entity";

export class CartItemEntity {
    id: number;
    quantity: number = 1;
    cartId: number;
    productVariantId: number;
    cart?: CartEntity;
    productVariant?: ProductVariantEntity;
} 