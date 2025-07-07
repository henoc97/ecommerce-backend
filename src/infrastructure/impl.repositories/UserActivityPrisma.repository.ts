import prisma from '../../../prisma/client/prisma.service';
import { UserActivityEntity } from '../../domain/entities/UserActivity.entity';
import { IUserActivityRepository } from '../../domain/repositories/UserActivity.repository';

export class UserActivityPrismaRepository implements IUserActivityRepository {
    async logActivity(data: UserActivityEntity): Promise<UserActivityEntity> {
        try {
            return await prisma.userActivity.create({ data }) as UserActivityEntity;
        } catch (error) {
            throw error;
        }
    }
    async listActivities(filter?: Partial<UserActivityEntity>): Promise<UserActivityEntity[]> {
        try {
            return await prisma.userActivity.findMany({ where: filter }) as UserActivityEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getShopActivities(shopId: number): Promise<UserActivityEntity[]> {
        try {
            // Suppose que l'activité est liée à un produit, qui est lié à un shop
            return await prisma.userActivity.findMany({ where: { product: { shopId } } }) as UserActivityEntity[];
        } catch (error) {
            throw error;
        }
    }
} 