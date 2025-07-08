import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client/prisma.service';
import { CategoryEntity } from '../../domain/entities/Category.entity';
import { ICategoryRepository } from '../../domain/repositories/Category.repository';
import { ProductEntity } from 'src/domain/entities/Product.entity';

export class CategoryPrismaRepository implements ICategoryRepository {
    async createCategory(data: CategoryEntity): Promise<CategoryEntity> {
        try {
            return await prisma.category.create({ data: data as Prisma.CategoryCreateInput }) as CategoryEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateCategory(id: number, data: Partial<CategoryEntity>): Promise<CategoryEntity> {
        try {
            return await prisma.category.update({ where: { id }, data: data as Prisma.CategoryCreateInput }) as CategoryEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteCategory(id: number): Promise<void> {
        try {
            await prisma.category.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<CategoryEntity> {
        try {
            return await prisma.category.findUnique({ where: { id } }) as CategoryEntity;
        } catch (error) {
            throw error;
        }
    }
    async listCategories(shopId?: number): Promise<CategoryEntity[]> {
        try {
            return await prisma.category.findMany({ where: shopId ? { shopId } : {} }) as CategoryEntity[];
        } catch (error) {
            throw error;
        }
    }

    async listProductsByCategory(category: string): Promise<ProductEntity[]> {
        try {
            const categories = await prisma.category.findMany({
                where: {
                    name: { contains: category, mode: 'insensitive' },
                },
                include: { products: true }
            });
            // Agrège tous les produits de toutes les catégories trouvées
            return categories.flatMap(cat => cat.products) || [];
        } catch (error) {
            throw error;
        }
    }

    async getShopProductsByCategory(shopId: number, category: string): Promise<ProductEntity[]> {
        try {
            const categories = await prisma.category.findMany({
                where: {
                    name: { contains: category, mode: 'insensitive' },
                    shopId
                },
                include: { products: true }
            });
            // Agrège tous les produits de toutes les catégories trouvées
            return categories.flatMap(cat => cat.products) || [];
        } catch (error) {
            throw error;
        }
    }
}