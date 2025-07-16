import { ProductImageEntity } from "../entities/ProductImage.entity";

export interface IProductImageRepository {
    addImage(productVariantId: number, url: string): Promise<ProductImageEntity>;
    deleteImage(id: number): Promise<void>;
    listImagesByVariant(productVariantId: number): Promise<ProductImageEntity[]>;
} 