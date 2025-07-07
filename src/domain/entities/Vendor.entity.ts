import { ShopEntity } from "./Shop.entity";
import { UserEntity } from "./User.entity";

export class VendorEntity {
    id: number;
    userId: number;
    user?: UserEntity;
    shops?: ShopEntity[];
} 