import { NotificationEntity } from "../entities/Notification.entity";

export interface INotificationRepository {
    createNotification(data: NotificationEntity): Promise<NotificationEntity>;
    markAsRead(id: number): Promise<void>;
    listNotifications(userId: number): Promise<NotificationEntity[]>;
    sendBulkNotification(data: NotificationEntity[]): Promise<void>;
    // GDPR - Recherche et suppression par utilisateur
    findByUserId(userId: number): Promise<NotificationEntity[]>;
    deleteByUserId(userId: number): Promise<void>;
}