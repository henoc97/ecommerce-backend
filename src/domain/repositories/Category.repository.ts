import { CategoryEntity } from "../entities/Category.entity";
import { ProductEntity } from "../entities/Product.entity";

export interface ICategoryRepository {
    createCategory(data: CategoryEntity): Promise<CategoryEntity>;
    updateCategory(id: number, data: Partial<CategoryEntity>): Promise<CategoryEntity>;
    deleteCategory(id: number): Promise<void>;
    findById(id: number): Promise<CategoryEntity>;
    getShopProductsByCategory(shopId: number, category: string): Promise<ProductEntity[]>;
    listProductsByCategory(category: string): Promise<ProductEntity[]>;
    listCategories(shopId?: number): Promise<CategoryEntity[]>;
} 