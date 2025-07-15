import prisma from '../../../prisma/client/prisma.service';
import { ProductEntity } from '../../domain/entities/Product.entity';
import { ProductVariantEntity } from '../../domain/entities/ProductVariant.entity';
import { CategoryEntity } from '../../domain/entities/Category.entity';
import { IProductRepository } from '../../domain/repositories/Product.repository';
import { Prisma } from '@prisma/client';

export class ProductPrismaRepository implements IProductRepository {
    async createProduct(data: ProductEntity): Promise<ProductEntity> {
        try {
            return await prisma.product.create({ data: data as Prisma.ProductCreateInput }) as ProductEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateProduct(id: number, data: Partial<ProductEntity>): Promise<ProductEntity> {
        try {
            return await prisma.product.update({ where: { id }, data: data as Prisma.ProductUpdateInput }) as ProductEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteProduct(id: number): Promise<void> {
        try {
            await prisma.product.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<ProductEntity> {
        try {
            return await prisma.product.findUnique({ where: { id } }) as ProductEntity;
        } catch (error) {
            throw error;
        }
    }
    async getProductWithVariantsImages(id: number): Promise<ProductEntity> {
        try {
            return await prisma.product.findUnique({
                where: { id },
                include: {
                    category: true,
                    productVariants: {
                        include: {
                            productImages: true,
                            promotions: true
                        }
                    }
                }
            }) as ProductEntity;
        } catch (error) {
            throw error;
        }
    }
    async listProducts(filter?: Partial<ProductEntity>): Promise<ProductEntity[]> {
        try {
            return await prisma.product.findMany({ where: filter as Prisma.ProductWhereInput }) as ProductEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getProductVariants(productId: number): Promise<ProductVariantEntity[]> {
        try {
            return await prisma.productVariant.findMany({ where: { productId } }) as ProductVariantEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getProductCategory(productId: number): Promise<CategoryEntity> {
        try {
            const product = await prisma.product.findUnique({ where: { id: productId }, include: { category: true } });
            return product?.category as CategoryEntity;
        } catch (error) {
            throw error;
        }
    }
    async hasProductRelations(id: number): Promise<boolean> {
        // Vérifie s'il existe des OrderItem ou Review liés à ce produit (via les variants)
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                productVariants: {
                    include: {
                        orderItems: true,
                        reviews: true,
                    },
                },
            },
        });
        if (!product) return false;
        for (const variant of product.productVariants) {
            if ((variant.orderItems && variant.orderItems.length > 0) || (variant.reviews && variant.reviews.length > 0)) {
                return true;
            }
        }
        return false;
    }
} 