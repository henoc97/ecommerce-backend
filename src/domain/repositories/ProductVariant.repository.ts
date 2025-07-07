import { ProductImageEntity } from "../entities/ProductImage.entity";
import { ProductVariantEntity } from "../entities/ProductVariant.entity";
import { PromotionEntity } from "../entities/Promotion.entity";

export interface IProductVariantRepository {
    createVariant(productId: number, data: ProductVariantEntity): Promise<ProductVariantEntity>;
    updateVariant(id: number, data: Partial<ProductVariantEntity>): Promise<ProductVariantEntity>;
    deleteVariant(id: number): Promise<void>;
    findById(id: number): Promise<ProductVariantEntity>;
    listVariants(productId: number): Promise<ProductVariantEntity[]>;
    setStock(id: number, stock: number): Promise<void>;
    setPrice(id: number, price: number): Promise<void>;
    getVariantImages(id: number): Promise<ProductImageEntity[]>;
    getVariantPromotions(id: number): Promise<PromotionEntity[]>;
} 