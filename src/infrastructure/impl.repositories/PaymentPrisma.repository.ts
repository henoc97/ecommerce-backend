import prisma from '../../../prisma/client/prisma.service';
import { PaymentEntity } from '../../domain/entities/Payment.entity';
import { IPaymentRepository } from '../../domain/repositories/Payment.repository';

export class PaymentPrismaRepository implements IPaymentRepository {
    async createPayment(data: PaymentEntity): Promise<PaymentEntity> {
        try {
            return await prisma.payment.create({ data }) as PaymentEntity;
        } catch (error) {
            throw error;
        }
    }
    async updatePayment(id: number, data: Partial<PaymentEntity>): Promise<PaymentEntity> {
        try {
            return await prisma.payment.update({ where: { id }, data }) as PaymentEntity;
        } catch (error) {
            throw error;
        }
    }
    async deletePayment(id: number): Promise<void> {
        try {
            await prisma.payment.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<PaymentEntity> {
        try {
            return await prisma.payment.findUnique({ where: { id } }) as PaymentEntity;
        } catch (error) {
            throw error;
        }
    }
    async listPayments(filter?: Partial<PaymentEntity>): Promise<PaymentEntity[]> {
        try {
            return await prisma.payment.findMany({ where: filter }) as PaymentEntity[];
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
    async getShopPayments(shopId: number): Promise<PaymentEntity[]> {
        try {
            return await prisma.payment.findMany({ where: { order: { shopId } } }) as PaymentEntity[];
        } catch (error) {
            throw error;
        }
    }
} 