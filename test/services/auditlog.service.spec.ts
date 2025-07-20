import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from '../../src/application/services/auditlog.service';
import { AuditLogPrismaRepository } from '../../src/infrastructure/impl.repositories/AuditLogPrisma.repository';

describe('AuditLogService', () => {
    let service: AuditLogService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditLogService,
                {
                    provide: AuditLogPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<AuditLogService>(AuditLogService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 