import { Injectable, Inject } from '@nestjs/common';
import { RefundPrismaRepository } from '../../infrastructure/impl.repositories/RefundPrisma.repository';
import { RefundEntity } from '../../domain/entities/Refund.entity';

@Injectable()
export class RefundService {
    constructor(
        @Inject(RefundPrismaRepository) private readonly repository: RefundPrismaRepository,
    ) { }

    async createRefund(data: RefundEntity) {
        try {
            return await this.repository.createRefund(data);
        } catch (error) {
            throw error;
        }
    }
    async updateRefund(id: number, data: Partial<RefundEntity>) {
        try {
            return await this.repository.updateRefund(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteRefund(id: number) {
        try {
            return await this.repository.deleteRefund(id);
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
    async listRefunds(filter?: Partial<RefundEntity>) {
        try {
            return await this.repository.listRefunds(filter);
        } catch (error) {
            throw error;
        }
    }
} 