import { CategoryEntity } from "./Category.entity";
import { ShopEntity } from "./Shop.entity";
import { ProductVariantEntity } from "./ProductVariant.entity";

export class ProductEntity {
    id: number;
    name: string;
    description?: string;
    productVariantKeys: string[]; // Array of keys for product variants, e.g., ["size", "color"]
    createdAt: Date;
    updatedAt: Date;
    categoryId: number;
    shopId: number;
    category?: CategoryEntity;
    shop?: ShopEntity;
    productVariants?: ProductVariantEntity[];
} 