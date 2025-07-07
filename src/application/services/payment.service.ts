import { Injectable, Inject } from '@nestjs/common';
import { PaymentPrismaRepository } from '../../infrastructure/impl.repositories/PaymentPrisma.repository';
import { PaymentEntity } from '../../domain/entities/Payment.entity';

@Injectable()
export class PaymentService {
    constructor(
        @Inject(PaymentPrismaRepository) private readonly repository: PaymentPrismaRepository,
    ) { }

    async createPayment(data: PaymentEntity) {
        try {
            return await this.repository.createPayment(data);
        } catch (error) {
            throw error;
        }
    }
    async updatePayment(id: number, data: Partial<PaymentEntity>) {
        try {
            return await this.repository.updatePayment(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deletePayment(id: number) {
        try {
            return await this.repository.deletePayment(id);
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
    async listPayments(filter?: Partial<PaymentEntity>) {
        try {
            return await this.repository.listPayments(filter);
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
    async getShopPayments(shopId: number) {
        try {
            return await this.repository.getShopPayments(shopId);
        } catch (error) {
            throw error;
        }
    }
} 