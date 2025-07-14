import { PaymentEntity } from "../entities/Payment.entity";

export interface IPaymentRepository {
    createPayment(data: PaymentEntity): Promise<PaymentEntity>;
    updatePayment(id: number, data: Partial<PaymentEntity>): Promise<PaymentEntity>;
    deletePayment(id: number): Promise<void>;
    findById(id: number): Promise<PaymentEntity>;
    listPayments(filter?: Partial<PaymentEntity>): Promise<PaymentEntity[]>;
    getUserPayments(userId: number): Promise<PaymentEntity[]>;
    getOrderPayment(orderId: number): Promise<PaymentEntity>;
    getShopPayments(shopId: number): Promise<PaymentEntity[]>;
} 