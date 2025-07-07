import prisma from '../../../prisma/client/prisma.service';
import { RefundEntity } from '../../domain/entities/Refund.entity';
import { IRefundRepository } from '../../domain/repositories/Refund.repository';

export class RefundPrismaRepository implements IRefundRepository {
    async createRefund(data: RefundEntity): Promise<RefundEntity> {
        try {
            return await prisma.refund.create({ data }) as RefundEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateRefund(id: number, data: Partial<RefundEntity>): Promise<RefundEntity> {
        try {
            return await prisma.refund.update({ where: { id }, data }) as RefundEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteRefund(id: number): Promise<void> {
        try {
            await prisma.refund.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<RefundEntity> {
        try {
            return await prisma.refund.findUnique({ where: { id } }) as RefundEntity;
        } catch (error) {
            throw error;
        }
    }
    async listRefunds(filter?: Partial<RefundEntity>): Promise<RefundEntity[]> {
        try {
            return await prisma.refund.findMany({ where: filter }) as RefundEntity[];
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
    async getShopRefunds(shopId: number): Promise<RefundEntity[]> {
        try {
            return await prisma.refund.findMany({ where: { order: { shopId } } }) as RefundEntity[];
        } catch (error) {
            throw error;
        }
    }
} 