import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client/prisma.service';
import { OrderEntity } from '../../domain/entities/Order.entity';
import { OrderItemEntity } from '../../domain/entities/OrderItem.entity';
import { PaymentEntity } from '../../domain/entities/Payment.entity';
import { RefundEntity } from '../../domain/entities/Refund.entity';
import { OrderStatus } from '../../domain/enums/OrderStatus.enum';
import { IOrderRepository } from '../../domain/repositories/Order.repository';

export class OrderPrismaRepository implements IOrderRepository {
    async createOrder(data: OrderEntity): Promise<OrderEntity> {
        try {
            return await prisma.order.create({ data: data as Prisma.OrderCreateInput }) as OrderEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateOrder(id: number, data: Partial<OrderEntity>): Promise<OrderEntity> {
        try {
            return await prisma.order.update({ where: { id }, data: data as Prisma.OrderUpdateInput }) as OrderEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteOrder(id: number): Promise<void> {
        try {
            await prisma.order.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<OrderEntity> {
        try {
            return await prisma.order.findUnique({ where: { id } }) as OrderEntity;
        } catch (error) {
            throw error;
        }
    }
    async listOrders(filter?: Partial<OrderEntity>): Promise<OrderEntity[]> {
        try {
            return await prisma.order.findMany({ where: filter as Prisma.OrderWhereInput }) as OrderEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getOrderItems(orderId: number): Promise<OrderItemEntity[]> {
        try {
            return await prisma.orderItem.findMany({ where: { orderId } }) as OrderItemEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getOrderPayment(orderId: number): Promise<PaymentEntity> {
        try {
            return await prisma.payment.findFirst({ where: { orderId } }) as PaymentEntity;
        } catch (error) {
            throw error;
        }
    }
    async getOrderRefund(orderId: number): Promise<RefundEntity> {
        try {
            return await prisma.refund.findFirst({ where: { orderId } }) as RefundEntity;
        } catch (error) {
            throw error;
        }
    }
    async getOrderStatus(orderId: number): Promise<OrderStatus> {
        try {
            const order = await prisma.order.findUnique({ where: { id: orderId } });
            return order?.status as OrderStatus;
        } catch (error) {
            throw error;
        }
    }
    async updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
        try {
            await prisma.order.update({ where: { id: orderId }, data: { status } });
        } catch (error) {
            throw error;
        }
    }
} 