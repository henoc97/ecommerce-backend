import { Currency } from "../enums/Currency.enum";
import { CartItemEntity } from "./CartItem.entity";
import { OrderItemEntity } from "./OrderItem.entity";
import { ProductEntity } from "./Product.entity";
import { ProductImageEntity } from "./ProductImage.entity";
import { PromotionEntity } from "./Promotion.entity";
import { ReviewEntity } from "./Review.entity";

export class ProductVariantEntity {
    id: number;
    productId: number;
    attributes: any; // JSON field to store variant attributes like size, color, etc.
    stock: number = 0;
    price: number = 0;
    currency: Currency;
    product?: ProductEntity;
    productImage?: ProductImageEntity[]; // Images specific to this variant
    promotions?: PromotionEntity[]; // Promotions applicable to this variant
    cartItem?: CartItemEntity[];
    orderItem?: OrderItemEntity[];
    reviews?: ReviewEntity[];
} 