import { DiscountType } from 'src/domain/enums/DiscountType.enum';
import prisma from '../../../prisma/client/prisma.service';
import { PromotionEntity } from '../../domain/entities/Promotion.entity';
import { IPromotionRepository } from '../../domain/repositories/Promotion.repository';
import { Prisma } from '@prisma/client';

export class PromotionPrismaRepository implements IPromotionRepository {
    async addPromotion(data: PromotionEntity): Promise<PromotionEntity> {
        try {
            return await prisma.promotion.create({ data: data as Prisma.PromotionCreateInput }) as PromotionEntity;
        } catch (error) {
            throw error;
        }
    }
    async updatePromotion(id: number, data: Partial<PromotionEntity>): Promise<PromotionEntity> {
        try {
            return await prisma.promotion.update({ where: { id }, data: data as Prisma.PromotionUpdateInput }) as PromotionEntity;
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
            return await prisma.promotion.findMany({ where: filter as Prisma.PromotionWhereInput }) as PromotionEntity[];
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
            // Promotions abusives :
            // - PERCENTAGE > 90
            // - FIXED_AMOUNT (on récupère le prix du variant pour post-traitement)
            // - startDate > endDate
            return await prisma.promotion.findMany({
                where: {
                    OR: [
                        { AND: [{ discountType: DiscountType.PERCENTAGE }, { discountValue: { gt: 90 } }] },
                        { AND: [{ discountType: DiscountType.FIXED_AMOUNT }, { discountValue: { gt: 0 } }] },
                        { startDate: { gt: prisma.promotion.fields.endDate } }
                    ]
                },
                include: {
                    productVariant: { select: { price: true } }
                }
            }) as PromotionEntity[];
        } catch (error) {
            throw error;
        }
    }
} 