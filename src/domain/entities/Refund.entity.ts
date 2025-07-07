import { RefundStatus } from "../enums/RefundStatus.enum";
import { OrderEntity } from "./Order.entity";

export class RefundEntity {
    id: number;
    orderId?: number;
    reason?: string; // refund reason
    amount: number = 0;
    status: RefundStatus;
    createdAt: Date;
    order?: OrderEntity;
} 