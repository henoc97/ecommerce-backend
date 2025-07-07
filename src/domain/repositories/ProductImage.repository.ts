import { ProductImageEntity } from "../entities/ProductImage.entity";

export interface IProductImageRepository {
    addImage(productVariantId: number, url: string): Promise<ProductImageEntity>;
    deleteImage(id: number): Promise<void>;
    findByVariantId(productVariantId: number): Promise<ProductImageEntity>;
    listImagesByVariant(productVariantId: number): Promise<ProductImageEntity[]>;
} 