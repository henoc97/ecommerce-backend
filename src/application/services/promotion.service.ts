import { Injectable, Inject } from '@nestjs/common';
import { PromotionPrismaRepository } from '../../infrastructure/impl.repositories/PromotionPrisma.repository';
import { PromotionEntity } from '../../domain/entities/Promotion.entity';

@Injectable()
export class PromotionService {
    constructor(
        @Inject(PromotionPrismaRepository) private readonly repository: PromotionPrismaRepository,
    ) { }

    async createPromotion(data: PromotionEntity) {
        try {
            return await this.repository.addPromotion(data);
        } catch (error) {
            throw error;
        }
    }
    async updatePromotion(id: number, data: Partial<PromotionEntity>) {
        try {
            return await this.repository.updatePromotion(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deletePromotion(id: number) {
        try {
            return await this.repository.deletePromotion(id);
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
    async listPromotions(filter?: Partial<PromotionEntity>) {
        try {
            return await this.repository.listPromotions(filter);
        } catch (error) {
            throw error;
        }
    }
    async getVariantPromotions(productVariantId: number) {
        try {
            return await this.repository.getVariantPromotions(productVariantId);
        } catch (error) {
            throw error;
        }
    }
    async detectAbusivePromotions() {
        try {
            return await this.repository.detectAbusivePromotions();
        } catch (error) {
            throw error;
        }
    }
} 