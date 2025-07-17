import prisma from '../../../prisma/client/prisma.service';
import { ShopSubscriptionEntity } from '../../domain/entities/ShopSubscription.entity';
import { IShopSubscriptionRepository } from '../../domain/repositories/ShopSubscription.repository';

export class ShopSubscriptionPrismaRepository implements IShopSubscriptionRepository {
    async subscribe(shopId: number, subscriptionId: number, startDate?: Date, endDate?: Date): Promise<ShopSubscriptionEntity> {
        try {
            return await prisma.shopSubscription.create({ data: { shopId, subscriptionId, startDate, endDate } }) as ShopSubscriptionEntity;
        } catch (error) {
            throw error;
        }
    }
    async getActiveSubscriptions(): Promise<ShopSubscriptionEntity[]> {
        try {
            const now = new Date();
            return await prisma.shopSubscription.findMany({
                where: {
                    OR: [
                        { endDate: null },
                        { endDate: { gt: now } }
                    ]
                }
            }) as ShopSubscriptionEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getExpiredSubscriptions(): Promise<ShopSubscriptionEntity[]> {
        try {
            const now = new Date();
            return await prisma.shopSubscription.findMany({
                where: {
                    endDate: { lte: now }
                }
            }) as ShopSubscriptionEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getShopSubscriptions(shopId: number): Promise<ShopSubscriptionEntity[]> {
        try {
            return await prisma.shopSubscription.findMany({ where: { shopId } }) as ShopSubscriptionEntity[];
        } catch (error) {
            throw error;
        }
    }
} 