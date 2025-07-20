import { Injectable, Inject } from '@nestjs/common';
import { AuditLogPrismaRepository } from '../../infrastructure/impl.repositories/AuditLogPrisma.repository';
import { AuditLogEntity } from '../../domain/entities/AuditLog.entity';

@Injectable()
export class AuditLogService {
    constructor(
        @Inject(AuditLogPrismaRepository) private readonly repository: AuditLogPrismaRepository,
    ) { }

    async logAction(data: AuditLogEntity) {
        try {
            return await this.repository.logAction(data);
        } catch (error) {
            throw error;
        }
    }
    async listLogs(filter?: Partial<AuditLogEntity>) {
        try {
            return await this.repository.listLogs(filter);
        } catch (error) {
            throw error;
        }
    }
    async getCriticalChanges(entity: string, entityId: number) {
        try {
            return await this.repository.getCriticalChanges(entity, entityId);
        } catch (error) {
            throw error;
        }
    }

    // GDPR - Recherche par utilisateur
    async findByUserId(userId: number) {
        try {
            return await this.repository.findByUserId(userId);
        } catch (error) {
            throw error;
        }
    }
} 