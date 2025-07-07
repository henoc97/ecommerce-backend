import { ProductEntity } from "../entities/Product.entity";
import { ProductVariantEntity } from "../entities/ProductVariant.entity";
import { CategoryEntity } from "../entities/Category.entity";

export interface IProductRepository {
    createProduct(data: ProductEntity): Promise<ProductEntity>;
    updateProduct(id: number, data: Partial<ProductEntity>): Promise<ProductEntity>;
    deleteProduct(id: number): Promise<void>;
    findById(id: number): Promise<ProductEntity>;
    listProducts(filter?: Partial<ProductEntity>): Promise<ProductEntity[]>;
    getProductVariants(productId: number): Promise<ProductVariantEntity[]>;
    getProductCategory(productId: number): Promise<CategoryEntity>;
} 