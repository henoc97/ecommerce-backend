import { AuditLogEntity } from "../entities/AuditLog.entity";

export interface IAuditLogRepository {
    logAction(data: AuditLogEntity): Promise<AuditLogEntity>;
    listLogs(filter?: Partial<AuditLogEntity>): Promise<AuditLogEntity[]>;
    getCriticalChanges(entity: string, entityId: number): Promise<AuditLogEntity[]>;
} 