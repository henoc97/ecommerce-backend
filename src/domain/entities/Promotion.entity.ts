import { DiscountType } from "../enums/DiscountType.enum";
import { ProductVariantEntity } from "./ProductVariant.entity";

export class PromotionEntity {
    id: number;
    name: string;
    discountValue: number = 0;
    discountType: DiscountType;
    startDate: Date;
    endDate: Date;
    productVariantId: number;
    createdAt: Date;
    updatedAt: Date;
    productVariant?: ProductVariantEntity;
} 