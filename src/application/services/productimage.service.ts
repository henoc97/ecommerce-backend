import { Injectable, Inject } from '@nestjs/common';
import { ProductImagePrismaRepository } from '../../infrastructure/impl.repositories/ProductImagePrisma.repository';

@Injectable()
export class ProductImageService {
    constructor(
        @Inject(ProductImagePrismaRepository) private readonly repository: ProductImagePrismaRepository,
    ) { }

    async addImage(productVariantId: number, url: string) {
        try {
            return await this.repository.addImage(productVariantId, url);
        } catch (error) {
            throw error;
        }
    }
    async deleteImage(id: number) {
        try {
            return await this.repository.deleteImage(id);
        } catch (error) {
            throw error;
        }
    }
    async listImagesByVariant(productVariantId: number) {
        try {
            return await this.repository.listImagesByVariant(productVariantId);
        } catch (error) {
            throw error;
        }
    }
} 