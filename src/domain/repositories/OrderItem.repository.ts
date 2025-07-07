import { OrderItemEntity } from "../entities/OrderItem.entity";

export interface IOrderItemRepository {
    addOrderItem(orderId: number, data: OrderItemEntity): Promise<OrderItemEntity>;
    updateOrderItem(id: number, data: Partial<OrderItemEntity>): Promise<OrderItemEntity>;
    deleteOrderItem(id: number): Promise<void>;
    findById(id: number): Promise<OrderItemEntity>;
    listItemsByOrder(orderId: number): Promise<OrderItemEntity[]>;
} 