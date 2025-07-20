import { PaymentPrismaRepository } from '../../src/infrastructure/impl.repositories/PaymentPrisma.repository';
import prisma from '../../prisma/client/prisma.service';
import { PaymentStatus } from '../../src/domain/enums/PaymentStatus.enum';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        payment: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
        order: { findMany: jest.fn() },
    },
}));

describe('PaymentPrismaRepository', () => {
    let repo: PaymentPrismaRepository;
    const payment = { id: 1, orderId: 1, status: PaymentStatus.SUCCESS };

    beforeEach(() => {
        repo = new PaymentPrismaRepository();
        jest.clearAllMocks();
    });

    it('createPayment crée un paiement', async () => {
        (prisma.payment.create as jest.Mock).mockResolvedValue(payment);
        const result = await repo.createPayment(payment as any);
        expect(prisma.payment.create).toHaveBeenCalledWith({ data: payment });
        expect(result).toEqual(payment);
    });

    it('updatePayment met à jour un paiement', async () => {
        (prisma.payment.update as jest.Mock).mockResolvedValue(payment);
        const result = await repo.updatePayment(1, { status: PaymentStatus.FAILED });
        expect(prisma.payment.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: PaymentStatus.FAILED } });
        expect(result).toEqual(payment);
    });

    it('deletePayment supprime un paiement', async () => {
        (prisma.payment.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deletePayment(1);
        expect(prisma.payment.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne un paiement', async () => {
        (prisma.payment.findUnique as jest.Mock).mockResolvedValue(payment);
        const result = await repo.findById(1);
        expect(prisma.payment.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(payment);
    });

    it('listPayments retourne une liste', async () => {
        (prisma.payment.findMany as jest.Mock).mockResolvedValue([payment]);
        const result = await repo.listPayments({ status: PaymentStatus.SUCCESS });
        expect(prisma.payment.findMany).toHaveBeenCalledWith({ where: { status: PaymentStatus.SUCCESS } });
        expect(result).toEqual([payment]);
    });

    it('getUserPayments retourne les paiements utilisateur', async () => {
        (prisma.payment.findMany as jest.Mock).mockResolvedValue([payment]);
        const result = await repo.getUserPayments(1);
        expect(prisma.payment.findMany).toHaveBeenCalledWith({ include: { order: { where: { userId: 1 } } } });
        expect(result).toEqual([payment]);
    });

    it('getOrderPayment retourne le paiement de la commande', async () => {
        (prisma.payment.findFirst as jest.Mock).mockResolvedValue(payment);
        const result = await repo.getOrderPayment(1);
        expect(prisma.payment.findFirst).toHaveBeenCalledWith({ where: { orderId: 1 } });
        expect(result).toEqual(payment);
    });

    it('getShopPayments retourne les paiements du shop', async () => {
        (prisma.payment.findMany as jest.Mock).mockResolvedValue([payment]);
        const result = await repo.getShopPayments(2);
        expect(prisma.payment.findMany).toHaveBeenCalledWith({ where: { order: { shopId: 2 } } });
        expect(result).toEqual([payment]);
    });

    it('getPaymentDetail retourne le détail du paiement', async () => {
        (prisma.payment.findUnique as jest.Mock).mockResolvedValue(payment);
        const result = await repo.getPaymentDetail(1);
        expect(prisma.payment.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { order: { include: { user: true } } } });
        expect(result).toEqual(payment);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.payment.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createPayment(payment as any)).rejects.toThrow('fail');
    });
}); 