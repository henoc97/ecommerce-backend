import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client/prisma.service';
import { OrderItemEntity } from '../../domain/entities/OrderItem.entity';
import { IOrderItemRepository } from '../../domain/repositories/OrderItem.repository';

export class OrderItemPrismaRepository implements IOrderItemRepository {
    async addOrderItem(orderId: number, data: OrderItemEntity): Promise<OrderItemEntity> {
        try {
            const { productVariantId, quantity, price } = data;
            return await prisma.orderItem.create({ data: { orderId, productVariantId, quantity, price } }) as OrderItemEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateOrderItem(id: number, data: Partial<OrderItemEntity>): Promise<OrderItemEntity> {
        try {
            return await prisma.orderItem.update({ where: { id }, data: data as Prisma.OrderItemUpdateInput }) as OrderItemEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteOrderItem(id: number): Promise<void> {
        try {
            await prisma.orderItem.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<OrderItemEntity> {
        try {
            return await prisma.orderItem.findUnique({ where: { id } }) as OrderItemEntity;
        } catch (error) {
            throw error;
        }
    }
    async listItemsByOrder(orderId: number): Promise<OrderItemEntity[]> {
        try {
            return await prisma.orderItem.findMany({ where: { orderId } }) as OrderItemEntity[];
        } catch (error) {
            throw error;
        }
    }
} 