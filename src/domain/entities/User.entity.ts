import { AddressEntity } from "./Address.entity";
import { CartEntity } from "./Cart.entity";
import { NotificationEntity } from "./Notification.entity";
import { OrderEntity } from "./Order.entity";
import { ReviewEntity } from "./Review.entity";
import { TicketEntity } from "./Ticket.entity";
import { UserActivityEntity } from "./UserActivity.entity";
import { VendorEntity } from "./Vendor.entity";
import { AuditLogEntity } from "./AuditLog.entity";

export class UserEntity {
    id: number;
    email: string;
    password?: string;
    name: string = "";
    phone?: string;
    isEmailVerified: boolean;
    authProvider: string;
    googleId?: string;
    lastLogin?: Date;
    role: string; // UserRole enum
    updatedAt: Date;
    createdAt: Date;
    // Relations (as arrays or objects)
    address?: AddressEntity;
    orders?: OrderEntity[];
    vendor?: VendorEntity;
    carts?: CartEntity[];
    reviews?: ReviewEntity[];
    notifications?: NotificationEntity[];
    tickets?: TicketEntity[];
    userActivitis?: UserActivityEntity[];
    auditLogs?: AuditLogEntity[];
} 