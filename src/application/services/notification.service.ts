import { Injectable, Inject } from '@nestjs/common';
import { NotificationPrismaRepository } from '../../infrastructure/impl.repositories/NotificationPrisma.repository';
import { NotificationEntity } from '../../domain/entities/Notification.entity';

@Injectable()
export class NotificationService {
    constructor(
        @Inject(NotificationPrismaRepository) private readonly repository: NotificationPrismaRepository,
    ) { }

    async createNotification(data: NotificationEntity) {
        try {
            return await this.repository.createNotification(data);
        } catch (error) {
            throw error;
        }
    }
    async markAsRead(id: number) {
        try {
            return await this.repository.markAsRead(id);
        } catch (error) {
            throw error;
        }
    }
    async listNotifications(userId: number) {
        try {
            return await this.repository.listNotifications(userId);
        } catch (error) {
            throw error;
        }
    }
    async sendBulkNotification(data: NotificationEntity[]) {
        try {
            return await this.repository.sendBulkNotification(data);
        } catch (error) {
            throw error;
        }
    }
} 