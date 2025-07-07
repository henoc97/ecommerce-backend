import { AuditLogAction } from "../enums/AuditLogAction.enum";
import { UserEntity } from "./User.entity";

export class AuditLogEntity {
    id: number;
    userId: number;
    action: AuditLogAction; // e.g., CREATED, UPDATED, DELETED
    entity: string; // Entité concernée, par exemple "Product", "Order"
    entityId: number;
    changes: any; // JSON field to store changes
    updatedAt: Date;
    createdAt: Date;
    user?: UserEntity;
} 