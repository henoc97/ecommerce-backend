import { RefundEntity } from "../entities/Refund.entity";

export interface IRefundRepository {
    createRefund(data: RefundEntity): Promise<RefundEntity>;
    updateRefund(id: number, data: Partial<RefundEntity>): Promise<RefundEntity>;
    deleteRefund(id: number): Promise<void>;
    findById(id: number): Promise<RefundEntity>;
    listRefunds(filter?: Partial<RefundEntity>): Promise<RefundEntity[]>;
    getOrderRefund(orderId: number): Promise<RefundEntity>;
    getShopRefunds(shopId: number): Promise<RefundEntity[]>;
} 