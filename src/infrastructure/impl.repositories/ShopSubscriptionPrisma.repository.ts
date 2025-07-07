import prisma from '../../../prisma/client/prisma.service';
import { ShopSubscriptionEntity } from '../../domain/entities/ShopSubscription.entity';
import { IShopSubscriptionRepository } from '../../domain/repositories/ShopSubscription.repository';

export class ShopSubscriptionPrismaRepository implements IShopSubscriptionRepository {
    async subscribe(shopId: number, subscriptionId: number): Promise<ShopSubscriptionEntity> {
        try {
            return await prisma.shopSubscription.create({ data: { shopId, subscriptionId } }) as ShopSubscriptionEntity;
        } catch (error) {
            throw error;
        }
    }
    async getActiveSubscriptions(): Promise<ShopSubscriptionEntity[]> {
        try {
            return await prisma.shopSubscription.findMany({ where: { isActive: true } }) as ShopSubscriptionEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getExpiredSubscriptions(): Promise<ShopSubscriptionEntity[]> {
        try {
            return await prisma.shopSubscription.findMany({ where: { isActive: false } }) as ShopSubscriptionEntity[];
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