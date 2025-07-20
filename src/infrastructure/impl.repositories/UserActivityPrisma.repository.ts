import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client/prisma.service';
import { UserActivityEntity } from '../../domain/entities/UserActivity.entity';
import { IUserActivityRepository } from '../../domain/repositories/UserActivity.repository';

export class UserActivityPrismaRepository implements IUserActivityRepository {
    async logActivity(data: UserActivityEntity): Promise<UserActivityEntity> {
        try {
            return await prisma.userActivity.create({ data: data as Prisma.UserActivityCreateInput }) as UserActivityEntity;
        } catch (error) {
            throw error;
        }
    }
    async listActivities(filter?: Partial<UserActivityEntity>): Promise<UserActivityEntity[]> {
        try {
            return await prisma.userActivity.findMany({ where: filter as Prisma.UserActivityWhereInput }) as UserActivityEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getShopActivities(shopId: number): Promise<UserActivityEntity[]> {
        try {
            // Récupérer les activités liées à un shop via productId OU orderId
            return await prisma.userActivity.findMany({
                where: {
                    OR: [
                        {
                            productId: {
                                in: (await prisma.product.findMany({
                                    where: { shopId },
                                    select: { id: true }
                                })).map(p => p.id)
                            }
                        },
                        {
                            orderId: {
                                in: (await prisma.order.findMany({
                                    where: { shopId },
                                    select: { id: true }
                                })).map(o => o.id)
                            }
                        }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            }) as UserActivityEntity[];
        } catch (error) {
            throw error;
        }
    }

    // GDPR - Recherche et suppression par utilisateur
    async findByUserId(userId: number): Promise<UserActivityEntity[]> {
        try {
            return await prisma.userActivity.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            }) as UserActivityEntity[];
        } catch (error) {
            throw error;
        }
    }

    async deleteByUserId(userId: number): Promise<void> {
        try {
            await prisma.userActivity.deleteMany({ where: { userId } });
        } catch (error) {
            throw error;
        }
    }
} 