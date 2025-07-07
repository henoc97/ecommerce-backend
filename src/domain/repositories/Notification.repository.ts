import { NotificationEntity } from "../entities/Notification.entity";

export interface INotificationRepository {
    createNotification(data: NotificationEntity): Promise<NotificationEntity>;
    markAsRead(id: number): Promise<void>;
    listNotifications(userId: number): Promise<NotificationEntity[]>;
    sendBulkNotification(data: NotificationEntity[]): Promise<void>;
}