import { Injectable, Inject } from '@nestjs/common';
import { ProductImagePrismaRepository } from '../../infrastructure/impl.repositories/ProductImagePrisma.repository';
import { ProductImageEntity } from '../../domain/entities/ProductImage.entity';

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
    async findByVariantId(productVariantId: number) {
        try {
            return await this.repository.findByVariantId(productVariantId);
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