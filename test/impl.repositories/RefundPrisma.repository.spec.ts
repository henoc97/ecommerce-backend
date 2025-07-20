import { RefundPrismaRepository } from '../../src/infrastructure/impl.repositories/RefundPrisma.repository';
import prisma from '../../prisma/client/prisma.service';
import { RefundStatus } from '../../src/domain/enums/RefundStatus.enum';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        refund: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
    },
}));

describe('RefundPrismaRepository', () => {
    let repo: RefundPrismaRepository;
    const refund = { id: 1, orderId: 1, status: RefundStatus.PENDING };

    beforeEach(() => {
        repo = new RefundPrismaRepository();
        jest.clearAllMocks();
    });

    it('createRefund crée un refund', async () => {
        (prisma.refund.create as jest.Mock).mockResolvedValue(refund);
        const result = await repo.createRefund(refund as any);
        expect(prisma.refund.create).toHaveBeenCalledWith({ data: refund });
        expect(result).toEqual(refund);
    });

    it('updateRefund met à jour un refund', async () => {
        (prisma.refund.update as jest.Mock).mockResolvedValue(refund);
        const result = await repo.updateRefund(1, { status: RefundStatus.APPROVED });
        expect(prisma.refund.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: RefundStatus.APPROVED } });
        expect(result).toEqual(refund);
    });

    it('deleteRefund supprime un refund', async () => {
        (prisma.refund.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteRefund(1);
        expect(prisma.refund.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne un refund', async () => {
        (prisma.refund.findUnique as jest.Mock).mockResolvedValue(refund);
        const result = await repo.findById(1);
        expect(prisma.refund.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(refund);
    });

    it('listRefunds retourne une liste', async () => {
        (prisma.refund.findMany as jest.Mock).mockResolvedValue([refund]);
        const result = await repo.listRefunds({ status: RefundStatus.PENDING, shopId: 2 });
        expect(prisma.refund.findMany).toHaveBeenCalledWith({ where: { status: RefundStatus.PENDING }, include: { order: { where: { shopId: 2 } } } });
        expect(result).toEqual([refund]);
    });

    it('getUserRefunds retourne les refunds utilisateur', async () => {
        (prisma.refund.findMany as jest.Mock).mockResolvedValue([refund]);
        const result = await repo.getUserRefunds(1);
        expect(prisma.refund.findMany).toHaveBeenCalledWith({ include: { order: { where: { userId: 1 } } } });
        expect(result).toEqual([refund]);
    });

    it('getOrderRefund retourne le refund de la commande', async () => {
        (prisma.refund.findFirst as jest.Mock).mockResolvedValue(refund);
        const result = await repo.getOrderRefund(1);
        expect(prisma.refund.findFirst).toHaveBeenCalledWith({ where: { orderId: 1 } });
        expect(result).toEqual(refund);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.refund.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createRefund(refund as any)).rejects.toThrow('fail');
    });
});
