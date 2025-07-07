import { ProductVariantEntity } from "./ProductVariant.entity";

export class ProductImageEntity {
    id: number;
    productVariantId: number;
    url: string;
    productVariant?: ProductVariantEntity;
} 