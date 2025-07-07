import { ProductEntity } from "./Product.entity";
import { ShopEntity } from "./Shop.entity";

export class CategoryEntity {
    id: number;
    name: string;
    parentId?: number;
    shopId?: number;
    parent?: CategoryEntity;
    children?: CategoryEntity[];
    products?: ProductEntity[];
    shop?: ShopEntity;
} 