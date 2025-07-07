import prisma from '../../../prisma/client/prisma.service';
import { ProductVariantEntity } from '../../domain/entities/ProductVariant.entity';
import { ProductImageEntity } from '../../domain/entities/ProductImage.entity';
import { PromotionEntity } from '../../domain/entities/Promotion.entity';
import { IProductVariantRepository } from '../../domain/repositories/ProductVariant.repository';

export class ProductVariantPrismaRepository implements IProductVariantRepository {
    async createVariant(productId: number, data: ProductVariantEntity): Promise<ProductVariantEntity> {
        try {
            return await prisma.productVariant.create({ data: { ...data, productId } }) as ProductVariantEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateVariant(id: number, data: Partial<ProductVariantEntity>): Promise<ProductVariantEntity> {
        try {
            return await prisma.productVariant.update({ where: { id }, data }) as ProductVariantEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteVariant(id: number): Promise<void> {
        try {
            await prisma.productVariant.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<ProductVariantEntity> {
        try {
            return await prisma.productVariant.findUnique({ where: { id } }) as ProductVariantEntity;
        } catch (error) {
            throw error;
        }
    }
    async listVariants(productId: number): Promise<ProductVariantEntity[]> {
        try {
            return await prisma.productVariant.findMany({ where: { productId } }) as ProductVariantEntity[];
        } catch (error) {
            throw error;
        }
    }
    async setStock(id: number, stock: number): Promise<void> {
        try {
            await prisma.productVariant.update({ where: { id }, data: { stock } });
        } catch (error) {
            throw error;
        }
    }
    async setPrice(id: number, price: number): Promise<void> {
        try {
            await prisma.productVariant.update({ where: { id }, data: { price } });
        } catch (error) {
            throw error;
        }
    }
    async getVariantImages(id: number): Promise<ProductImageEntity[]> {
        try {
            return await prisma.productImage.findMany({ where: { productVariantId: id } }) as ProductImageEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getVariantPromotions(id: number): Promise<PromotionEntity[]> {
        try {
            return await prisma.promotion.findMany({ where: { productVariantId: id } }) as PromotionEntity[];
        } catch (error) {
            throw error;
        }
    }
}
