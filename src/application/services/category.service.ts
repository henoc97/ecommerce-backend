import { Injectable, Inject } from '@nestjs/common';
import { CategoryPrismaRepository } from '../../infrastructure/impl.repositories/CategoryPrisma.repository';
import { CategoryEntity } from '../../domain/entities/Category.entity';

@Injectable()
export class CategoryService {
    constructor(
        @Inject(CategoryPrismaRepository) private readonly repository: CategoryPrismaRepository,
    ) { }

    async createCategory(data: CategoryEntity) {
        try {
            return await this.repository.createCategory(data);
        } catch (error) {
            throw error;
        }
    }
    async updateCategory(id: number, data: Partial<CategoryEntity>) {
        try {
            return await this.repository.updateCategory(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteCategory(id: number) {
        try {
            return await this.repository.deleteCategory(id);
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
    async listCategories(shopId?: number) {
        try {
            return await this.repository.listCategories(shopId);
        } catch (error) {
            throw error;
        }
    }
    async listProductsByCategory(category: string) {
        try {
            return await this.repository.listProductsByCategory(category);
        } catch (error) {
            throw error;
        }
    }
    async getShopProductsByCategory(shopId: number, category: string) {
        try {
            return await this.repository.getShopProductsByCategory(shopId, category);
        } catch (error) {
            throw error;
        }
    }
} 