import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client/prisma.service';
import { SubscriptionEntity } from '../../domain/entities/Subscription.entity';
import { ISubscriptionRepository } from '../../domain/repositories/Subscription.repository';

export class SubscriptionPrismaRepository implements ISubscriptionRepository {
    async createSubscription(data: SubscriptionEntity): Promise<SubscriptionEntity> {
        try {
            return await prisma.subscription.create({ data: data as Prisma.SubscriptionCreateInput }) as SubscriptionEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateSubscription(id: number, data: Partial<SubscriptionEntity>): Promise<SubscriptionEntity> {
        try {
            return await prisma.subscription.update({ where: { id }, data: data as Prisma.SubscriptionUpdateInput }) as SubscriptionEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteSubscription(id: number): Promise<void> {
        try {
            await prisma.subscription.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<SubscriptionEntity> {
        try {
            return await prisma.subscription.findUnique({ where: { id } }) as SubscriptionEntity;
        } catch (error) {
            throw error;
        }
    }
    async listSubscriptions(): Promise<SubscriptionEntity[]> {
        try {
            return await prisma.subscription.findMany() as SubscriptionEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getShopSubscriptions(shopId: number): Promise<SubscriptionEntity[]> {
        try {
            return await prisma.subscription.findMany({ where: { shopSubscriptions: { some: { shopId } } } }) as SubscriptionEntity[];
        } catch (error) {
            throw error;
        }
    }
} 