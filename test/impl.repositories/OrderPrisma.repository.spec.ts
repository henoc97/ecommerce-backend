import { OrderPrismaRepository } from '../../src/infrastructure/impl.repositories/OrderPrisma.repository';
import prisma from '../../prisma/client/prisma.service';
import { OrderStatus } from '../../src/domain/enums/OrderStatus.enum';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        order: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            updateMany: jest.fn(),
            deleteMany: jest.fn(),
            groupBy: jest.fn(),
        },
        orderItem: {
            findMany: jest.fn(),
        },
        payment: {
            findFirst: jest.fn(),
        },
        refund: {
            findFirst: jest.fn(),
        },
        shop: {
            findMany: jest.fn(),
        },
        productVariant: {
            findMany: jest.fn(),
        },
    },
}));

describe('OrderPrismaRepository', () => {
    let repo: OrderPrismaRepository;
    const order = { id: 1, userId: 1, shopId: 2, status: OrderStatus.PENDING };
    const item = { id: 1, orderId: 1, productVariantId: 2, quantity: 3 };
    const payment = { id: 1, orderId: 1, status: 'SUCCESS' };
    const refund = { id: 1, orderId: 1 };

    beforeEach(() => {
        repo = new OrderPrismaRepository();
        jest.clearAllMocks();
    });

    it('createOrder crée une commande', async () => {
        (prisma.order.create as jest.Mock).mockResolvedValue(order);
        const result = await repo.createOrder(order as any);
        expect(prisma.order.create).toHaveBeenCalledWith({ data: order });
        expect(result).toEqual(order);
    });

    it('updateOrder met à jour une commande', async () => {
        (prisma.order.update as jest.Mock).mockResolvedValue(order);
        const result = await repo.updateOrder(1, { status: OrderStatus.CANCELLED });
        expect(prisma.order.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: OrderStatus.CANCELLED } });
        expect(result).toEqual(order);
    });

    it('deleteOrder supprime une commande', async () => {
        (prisma.order.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteOrder(1);
        expect(prisma.order.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne une commande', async () => {
        (prisma.order.findUnique as jest.Mock).mockResolvedValue(order);
        const result = await repo.findById(1);
        expect(prisma.order.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { items: true, payment: true, shop: true, refund: true } });
        expect(result).toEqual(order);
    });

    it('listOrders retourne une liste', async () => {
        (prisma.order.findMany as jest.Mock).mockResolvedValue([order]);
        const result = await repo.listOrders({ status: OrderStatus.PENDING });
        expect(prisma.order.findMany).toHaveBeenCalledWith({ where: { status: OrderStatus.PENDING }, include: { items: true, payment: true, shop: true, refund: true } });
        expect(result).toEqual([order]);
    });

    it('listExpiredUnpaidOrders retourne les commandes expirées', async () => {
        (prisma.order.findMany as jest.Mock).mockResolvedValue([order]);
        const now = new Date();
        const result = await repo.listExpiredUnpaidOrders(now);
        expect(prisma.order.findMany).toHaveBeenCalledWith({ where: { status: OrderStatus.PENDING, expiresAt: { lt: now }, paymentId: null } });
        expect(result).toEqual([order]);
    });

    it('getOrderItems retourne les items', async () => {
        (prisma.orderItem.findMany as jest.Mock).mockResolvedValue([item]);
        const result = await repo.getOrderItems(1);
        expect(prisma.orderItem.findMany).toHaveBeenCalledWith({ where: { orderId: 1 } });
        expect(result).toEqual([item]);
    });

    it('getOrderPayment retourne le paiement', async () => {
        (prisma.payment.findFirst as jest.Mock).mockResolvedValue(payment);
        const result = await repo.getOrderPayment(1);
        expect(prisma.payment.findFirst).toHaveBeenCalledWith({ where: { AND: { orderId: 1, status: 'SUCCESS' } } });
        expect(result).toEqual(payment);
    });

    it('getOrderRefund retourne le refund', async () => {
        (prisma.refund.findFirst as jest.Mock).mockResolvedValue(refund);
        const result = await repo.getOrderRefund(1);
        expect(prisma.refund.findFirst).toHaveBeenCalledWith({ where: { orderId: 1 } });
        expect(result).toEqual(refund);
    });

    it('getOrderStatus retourne le statut', async () => {
        (prisma.order.findUnique as jest.Mock).mockResolvedValue({ status: 'PENDING' });
        const result = await repo.getOrderStatus(1);
        expect(prisma.order.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toBe('PENDING');
    });

    it('updateOrderStatus met à jour le statut', async () => {
        (prisma.order.update as jest.Mock).mockResolvedValue(undefined);
        await repo.updateOrderStatus(1, OrderStatus.CANCELLED);
        expect(prisma.order.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: OrderStatus.CANCELLED } });
    });

    it('findByUserId retourne les commandes par user', async () => {
        (prisma.order.findMany as jest.Mock).mockResolvedValue([order]);
        const result = await repo.findByUserId(1);
        expect(prisma.order.findMany).toHaveBeenCalledWith({ where: { userId: 1 }, include: { items: true, payment: true, shop: true, refund: true } });
        expect(result).toEqual([order]);
    });

    it('anonymizeByUserId anonymise les commandes', async () => {
        (prisma.order.updateMany as jest.Mock).mockResolvedValue(undefined);
        await repo.anonymizeByUserId(1);
        expect(prisma.order.updateMany).toHaveBeenCalledWith({ where: { userId: 1 }, data: { userId: null } });
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.order.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createOrder(order as any)).rejects.toThrow('fail');
    });
}); 