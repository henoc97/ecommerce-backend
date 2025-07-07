import { UserEntity } from "./User.entity";
import { UserActivityAction } from "../enums/UserActivityAction.enum";

export class UserActivityEntity {
    id: number;
    action: UserActivityAction; // e.g., VIEWED_PRODUCT, ADDED_TO_CART
    keyword?: string;
    userId: number;
    productId?: number;
    orderId?: number;
    createdAt: Date;
    updatedAt: Date;
    user?: UserEntity;
} 