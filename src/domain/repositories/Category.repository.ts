import { CategoryEntity } from "../entities/Category.entity";

export interface ICategoryRepository {
    createCategory(data: CategoryEntity): Promise<CategoryEntity>;
    updateCategory(id: number, data: Partial<CategoryEntity>): Promise<CategoryEntity>;
    deleteCategory(id: number): Promise<void>;
    findById(id: number): Promise<CategoryEntity>;
    listCategories(shopId?: number): Promise<CategoryEntity[]>;
} 