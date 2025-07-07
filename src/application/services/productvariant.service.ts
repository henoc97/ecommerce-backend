import { Injectable, Inject } from '@nestjs/common';
import { ProductVariantPrismaRepository } from '../../infrastructure/impl.repositories/ProductVariantPrisma.repository';
import { ProductVariantEntity } from '../../domain/entities/ProductVariant.entity';

@Injectable()
export class ProductVariantService {
    constructor(
        @Inject(ProductVariantPrismaRepository) private readonly repository: ProductVariantPrismaRepository,
    ) { }

    async createVariant(productId: number, data: ProductVariantEntity) {
        try {
            return await this.repository.createVariant(productId, data);
        } catch (error) {
            throw error;
        }
    }
    async updateVariant(id: number, data: Partial<ProductVariantEntity>) {
        try {
            return await this.repository.updateVariant(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteVariant(id: number) {
        try {
            return await this.repository.deleteVariant(id);
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number) {
        try {
            return await this.repository.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async listVariants(productId: number) {
        try {
            return await this.repository.listVariants(productId);
        } catch (error) {
            throw error;
        }
    }
    async setStock(id: number, stock: number) {
        try {
            return await this.repository.setStock(id, stock);
        } catch (error) {
            throw error;
        }
    }
    async setPrice(id: number, price: number) {
        try {
            return await this.repository.setPrice(id, price);
        } catch (error) {
            throw error;
        }
    }
    async getVariantImages(id: number) {
        try {
            return await this.repository.getVariantImages(id);
        } catch (error) {
            throw error;
        }
    }
    async getVariantPromotions(id: number) {
        try {
            return await this.repository.getVariantPromotions(id);
        } catch (error) {
            throw error;
        }
    }
} 