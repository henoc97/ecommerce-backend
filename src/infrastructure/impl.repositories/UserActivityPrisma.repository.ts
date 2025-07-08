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
            // TODO: Implémenter la logique pour récupérer les activités liées à un shop
            throw new Error('Method not implemented');
        } catch (error) {
            throw error;
        }
    }
} 