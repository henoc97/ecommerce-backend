import { NotificationType } from "../enums/NotificationType.enum";
import { UserEntity } from "./User.entity";

export class NotificationEntity {
    id: number;
    userId: number;
    type: NotificationType;
    content: string;
    isRead: boolean;
    sentAt: Date;
    user?: UserEntity;
}