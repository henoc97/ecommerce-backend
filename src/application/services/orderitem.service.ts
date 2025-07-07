import { Injectable, Inject } from '@nestjs/common';
import { OrderItemPrismaRepository } from '../../infrastructure/impl.repositories/OrderItemPrisma.repository';
import { OrderItemEntity } from '../../domain/entities/OrderItem.entity';

@Injectable()
export class OrderItemService {
    constructor(
        @Inject(OrderItemPrismaRepository) private readonly repository: OrderItemPrismaRepository,
    ) { }

    async addOrderItem(orderId: number, data: OrderItemEntity) {
        try {
            return await this.repository.addOrderItem(orderId, data);
        } catch (error) {
            throw error;
        }
    }
    async updateOrderItem(id: number, data: Partial<OrderItemEntity>) {
        try {
            return await this.repository.updateOrderItem(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteOrderItem(id: number) {
        try {
            return await this.repository.deleteOrderItem(id);
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number) {
        try {
            return await this.repository.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async listItemsByOrder(orderId: number) {
        try {
            return await this.repository.listItemsByOrder(orderId);
        } catch (error) {
            throw error;
        }
    }
} 