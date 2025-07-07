import prisma from '../../../prisma/client/prisma.service';
import { AuditLogEntity } from '../../domain/entities/AuditLog.entity';
import { IAuditLogRepository } from '../../domain/repositories/AuditLog.repository';

export class AuditLogPrismaRepository implements IAuditLogRepository {
    async logAction(data: AuditLogEntity): Promise<AuditLogEntity> {
        try {
            return await prisma.auditLog.create({ data }) as AuditLogEntity;
        } catch (error) {
            throw error;
        }
    }
    async listLogs(filter?: Partial<AuditLogEntity>): Promise<AuditLogEntity[]> {
        try {
            return await prisma.auditLog.findMany({ where: filter }) as AuditLogEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getCriticalChanges(entity: string, entityId: number): Promise<AuditLogEntity[]> {
        try {
            return await prisma.auditLog.findMany({ where: { entity, entityId } }) as AuditLogEntity[];
        } catch (error) {
            throw error;
        }
    }
} 