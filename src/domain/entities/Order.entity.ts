import { ShopEntity } from "./Shop.entity";
import { OrderItemEntity } from "./OrderItem.entity";
import { UserEntity } from "./User.entity";
import { PaymentEntity } from "./Payment.entity";
import { RefundEntity } from "./Refund.entity";
import { OrderStatus } from "../enums/OrderStatus.enum";

export class OrderEntity {
    id: number;
    totalAmount: number = 0;
    paymentId?: number;
    refundId?: number;
    trackingNumber?: string;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    shopId: number;
    user?: UserEntity;
    shop?: ShopEntity;
    items?: OrderItemEntity[];
    payment?: PaymentEntity;
    refund?: RefundEntity;
    expiresAt?: Date;
} 