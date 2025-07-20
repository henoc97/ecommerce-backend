import { OrderEntity } from "../entities/Order.entity";
import { OrderItemEntity } from "../entities/OrderItem.entity";
import { PaymentEntity } from "../entities/Payment.entity";
import { RefundEntity } from "../entities/Refund.entity";
import { OrderStatus } from "../enums/OrderStatus.enum";

export interface IOrderRepository {
    createOrder(data: OrderEntity): Promise<OrderEntity>;
    updateOrder(id: number, data: Partial<OrderEntity>): Promise<OrderEntity>;
    deleteOrder(id: number): Promise<void>;
    findById(id: number): Promise<OrderEntity>;
    listOrders(filter?: Partial<OrderEntity>): Promise<OrderEntity[]>;
    getOrderItems(orderId: number): Promise<OrderItemEntity[]>;
    getOrderPayment(orderId: number): Promise<PaymentEntity>;
    getOrderRefund(orderId: number): Promise<RefundEntity>;
    getOrderStatus(orderId: number): Promise<OrderStatus>;
    updateOrderStatus(orderId: number, status: OrderStatus): Promise<void>;
    // GDPR - Recherche et anonymisation
    findByUserId(userId: number): Promise<OrderEntity[]>;
    anonymizeByUserId(userId: number): Promise<void>;
} 