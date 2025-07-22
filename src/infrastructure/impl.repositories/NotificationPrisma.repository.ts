import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client/prisma.service';
import { NotificationEntity } from '../../domain/entities/Notification.entity';
import { INotificationRepository } from '../../domain/repositories/Notification.repository';

export class NotificationPrismaRepository implements INotificationRepository {
    async createNotification(data: NotificationEntity): Promise<NotificationEntity> {
        try {
            return await prisma.notification.create({ data: data as Prisma.NotificationCreateInput }) as NotificationEntity;
        } catch (error) {
            throw error;
        }
    }
    async markAsRead(id: number): Promise<void> {
        try {
            await prisma.notification.update({ where: { id }, data: { isRead: true } });
        } catch (error) {
            throw error;
        }
    }
    async listNotifications(userId: number): Promise<NotificationEntity[]> {
        try {
            return await prisma.notification.findMany({ where: { userId } }) as NotificationEntity[];
        } catch (error) {
            throw error;
        }
    }
    async sendBulkNotification(data: NotificationEntity[]): Promise<void> {
        try {
            await prisma.notification.createMany({ data });
        } catch (error) {
            throw error;
        }
    }

    // GDPR - Recherche et suppression par utilisateur
    async findByUserId(userId: number): Promise<NotificationEntity[]> {
        try {
            return await prisma.notification.findMany({ where: { userId } }) as NotificationEntity[];
        } catch (error) {
            throw error;
        }
    }

    async deleteByUserId(userId: number): Promise<void> {
        try {
            await prisma.notification.deleteMany({ where: { userId } });
        } catch (error) {
            throw error;
        }
    }
} 