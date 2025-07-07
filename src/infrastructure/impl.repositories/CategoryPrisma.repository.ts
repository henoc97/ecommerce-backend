import prisma from '../../../prisma/client/prisma.service';
import { CategoryEntity } from '../../domain/entities/Category.entity';
import { ICategoryRepository } from '../../domain/repositories/Category.repository';

export class CategoryPrismaRepository implements ICategoryRepository {
    async createCategory(data: CategoryEntity): Promise<CategoryEntity> {
        try {
            return await prisma.category.create({ data }) as CategoryEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateCategory(id: number, data: Partial<CategoryEntity>): Promise<CategoryEntity> {
        try {
            return await prisma.category.update({ where: { id }, data }) as CategoryEntity;
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
} 