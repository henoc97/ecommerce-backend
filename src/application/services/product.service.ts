import { Injectable, Inject } from '@nestjs/common';
import { ProductPrismaRepository } from '../../infrastructure/impl.repositories/ProductPrisma.repository';
import { ProductEntity } from '../../domain/entities/Product.entity';
import { ProductVariantEntity } from '../../domain/entities/ProductVariant.entity';
import { CategoryEntity } from '../../domain/entities/Category.entity';

@Injectable()
export class ProductService {
    constructor(
        @Inject(ProductPrismaRepository) private readonly repository: ProductPrismaRepository,
    ) { }

    async createProduct(data: ProductEntity) {
        try {
            return await this.repository.createProduct(data);
        } catch (error) {
            throw error;
        }
    }
    async updateProduct(id: number, data: Partial<ProductEntity>) {
        try {
            return await this.repository.updateProduct(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteProduct(id: number) {
        try {
            return await this.repository.deleteProduct(id);
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
    async getProductWithVariantsImages(id: number) {
        try {
            return await this.repository.getProductWithVariantsImages(id);
        } catch (error) {
            throw error;
        }
    }
    async listProducts(filter?: Partial<ProductEntity>) {
        try {
            return await this.repository.listProducts(filter);
        } catch (error) {
            throw error;
        }
    }
    async getProductVariants(productId: number) {
        try {
            return await this.repository.getProductVariants(productId);
        } catch (error) {
            throw error;
        }
    }
    async getProductCategory(productId: number) {
        try {
            return await this.repository.getProductCategory(productId);
        } catch (error) {
            throw error;
        }
    }

    async hasProductRelations(id: number): Promise<boolean> {
        // Délègue au repository une vérification des relations bloquantes (commandes, reviews, etc.)
        try {
            return await this.repository.hasProductRelations(id);
        } catch (error) {
            throw error;
        }
    }
} 