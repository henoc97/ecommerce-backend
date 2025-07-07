import prisma from '../../../prisma/client/prisma.service';
import { PromotionEntity } from '../../domain/entities/Promotion.entity';
import { IPromotionRepository } from '../../domain/repositories/Promotion.repository';

export class PromotionPrismaRepository implements IPromotionRepository {
    async addPromotion(data: PromotionEntity): Promise<PromotionEntity> {
        try {
            return await prisma.promotion.create({ data }) as PromotionEntity;
        } catch (error) {
            throw error;
        }
    }
    async updatePromotion(id: number, data: Partial<PromotionEntity>): Promise<PromotionEntity> {
        try {
            return await prisma.promotion.update({ where: { id }, data }) as PromotionEntity;
        } catch (error) {
            throw error;
        }
    }
    async deletePromotion(id: number): Promise<void> {
        try {
            await prisma.promotion.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<PromotionEntity> {
        try {
            return await prisma.promotion.findUnique({ where: { id } }) as PromotionEntity;
        } catch (error) {
            throw error;
        }
    }
    async listPromotions(filter?: Partial<PromotionEntity>): Promise<PromotionEntity[]> {
        try {
            return await prisma.promotion.findMany({ where: filter }) as PromotionEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getVariantPromotions(productVariantId: number): Promise<PromotionEntity[]> {
        try {
            return await prisma.promotion.findMany({ where: { productVariantId } }) as PromotionEntity[];
        } catch (error) {
            throw error;
        }
    }
    async detectAbusivePromotions(): Promise<PromotionEntity[]> {
        try {
            // Exemple: discountValue > 90 ou dates incohérentes
            return await prisma.promotion.findMany({ where: { OR: [{ discountValue: { gt: 90 } }, { startDate: { gt: prisma.promotion.fields.endDate } }] } }) as PromotionEntity[];
        } catch (error) {
            throw error;
        }
    }
} 