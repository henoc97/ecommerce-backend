import prisma from '../../../prisma/client/prisma.service';
import { ProductImageEntity } from '../../domain/entities/ProductImage.entity';
import { IProductImageRepository } from '../../domain/repositories/ProductImage.repository';

export class ProductImagePrismaRepository implements IProductImageRepository {
    async addImage(productVariantId: number, url: string): Promise<ProductImageEntity> {
        try {
            return await prisma.productImage.create({ data: { productVariantId, url } }) as ProductImageEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteImage(id: number): Promise<void> {
        try {
            await prisma.productImage.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async listImagesByVariant(productVariantId: number): Promise<ProductImageEntity[]> {
        try {
            return await prisma.productImage.findMany({ where: { productVariantId } }) as ProductImageEntity[];
        } catch (error) {
            throw error;
        }
    }
} 