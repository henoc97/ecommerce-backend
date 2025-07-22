import { AuditLogPrismaRepository } from '../../src/infrastructure/impl.repositories/AuditLogPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        auditLog: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('AuditLogPrismaRepository', () => {
    let repo: AuditLogPrismaRepository;
    const log = { id: 1, entity: 'User', entityId: 1, action: 'CREATE', createdAt: new Date() };

    beforeEach(() => {
        repo = new AuditLogPrismaRepository();
        jest.clearAllMocks();
    });

    it('logAction crée un log', async () => {
        (prisma.auditLog.create as jest.Mock).mockResolvedValue(log);
        const result = await repo.logAction(log as any);
        expect(prisma.auditLog.create).toHaveBeenCalledWith({ data: log });
        expect(result).toEqual(log);
    });

    it('listLogs retourne une liste', async () => {
        (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([log]);
        const result = await repo.listLogs({ entity: 'User' });
        expect(prisma.auditLog.findMany).toHaveBeenCalledWith({ where: { entity: 'User' } });
        expect(result).toEqual([log]);
    });

    it('getCriticalChanges retourne les logs critiques', async () => {
        (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([log]);
        const result = await repo.getCriticalChanges('User', 1);
        expect(prisma.auditLog.findMany).toHaveBeenCalledWith({ where: { entity: 'User', entityId: 1 } });
        expect(result).toEqual([log]);
    });

    it('findByUserId retourne les logs par user', async () => {
        (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([log]);
        const result = await repo.findByUserId(1);
        expect(prisma.auditLog.findMany).toHaveBeenCalledWith({ where: { userId: 1 }, orderBy: { createdAt: 'desc' } });
        expect(result).toEqual([log]);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.auditLog.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.logAction(log as any)).rejects.toThrow('fail');
    });
}); 