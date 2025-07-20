import { Injectable, Inject } from '@nestjs/common';
import { OrderPrismaRepository } from '../../infrastructure/impl.repositories/OrderPrisma.repository';
import { OrderEntity } from '../../domain/entities/Order.entity';
import { OrderItemEntity } from '../../domain/entities/OrderItem.entity';
import { PaymentEntity } from '../../domain/entities/Payment.entity';
import { RefundEntity } from '../../domain/entities/Refund.entity';
import { OrderStatus } from '../../domain/enums/OrderStatus.enum';

@Injectable()
export class OrderService {
    constructor(
        @Inject(OrderPrismaRepository) private readonly repository: OrderPrismaRepository,
    ) { }

    async createOrder(data: OrderEntity) {
        try {
            return await this.repository.createOrder(data);
        } catch (error) {
            throw error;
        }
    }
    async updateOrder(id: number, data: Partial<OrderEntity>) {
        try {
            return await this.repository.updateOrder(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteOrder(id: number) {
        try {
            return await this.repository.deleteOrder(id);
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
    async listOrders(filter?: Partial<OrderEntity>) {
        try {
            return await this.repository.listOrders(filter);
        } catch (error) {
            throw error;
        }
    }
    async getOrderItems(orderId: number) {
        try {
            return await this.repository.getOrderItems(orderId);
        } catch (error) {
            throw error;
        }
    }
    async getOrderPayment(orderId: number) {
        try {
            return await this.repository.getOrderPayment(orderId);
        } catch (error) {
            throw error;
        }
    }
    async getOrderRefund(orderId: number) {
        try {
            return await this.repository.getOrderRefund(orderId);
        } catch (error) {
            throw error;
        }
    }
    async getOrderStatus(orderId: number) {
        try {
            return await this.repository.getOrderStatus(orderId);
        } catch (error) {
            throw error;
        }
    }
    async updateOrderStatus(orderId: number, status: OrderStatus) {
        try {
            return await this.repository.updateOrderStatus(orderId, status);
        } catch (error) {
            throw error;
        }
    }
    async findByShopId(shopId: number) {
        try {
            return await this.listOrders({ shopId });
        } catch (error) {
            throw error;
        }
    }
    async findByIdWithDetails(id: number) {
        try {
            return await this.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async cancelExpiredUnpaidOrders() {
        const now = new Date();
        const expiredOrders = await this.repository.listExpiredUnpaidOrders(now);
        for (const order of expiredOrders) {
            await this.repository.updateOrderStatus(order.id, OrderStatus.CANCELLED);
        }
        return expiredOrders.length;
    }

    // GDPR - Recherche et anonymisation
    async findByUserId(userId: number) {
        try {
            return await this.repository.findByUserId(userId);
        } catch (error) {
            throw error;
        }
    }

    async anonymizeByUserId(userId: number) {
        try {
            return await this.repository.anonymizeByUserId(userId);
        } catch (error) {
            throw error;
        }
    }
} 