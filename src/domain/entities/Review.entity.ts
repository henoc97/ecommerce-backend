import { ProductVariantEntity } from "./ProductVariant.entity";
import { UserEntity } from "./User.entity";

export class ReviewEntity {
    id: number;
    rating: number = 1;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    productVariantId: number;
    user?: UserEntity;
    productVariant?: ProductVariantEntity;
} 