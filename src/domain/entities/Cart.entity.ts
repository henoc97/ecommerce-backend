import { CartItemEntity } from "./CartItem.entity";
import { ShopEntity } from "./Shop.entity";
import { UserEntity } from "./User.entity";

export class CartEntity {
    id: number;
    userId: number;
    shopId: number;
    totalPrice: number = 0;
    totalQuantity: number = 0;
    user?: UserEntity;
    shop?: ShopEntity;
    items?: CartItemEntity[];
} 