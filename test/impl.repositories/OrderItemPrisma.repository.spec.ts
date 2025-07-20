import { OrderItemPrismaRepository } from '../../src/infrastructure/impl.repositories/OrderItemPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        orderItem: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('OrderItemPrismaRepository', () => {
    let repo: OrderItemPrismaRepository;
    const item = { id: 1, orderId: 1, productVariantId: 2, quantity: 3, price: 10 };

    beforeEach(() => {
        repo = new OrderItemPrismaRepository();
        jest.clearAllMocks();
    });

    it('addOrderItem ajoute un item', async () => {
        (prisma.orderItem.create as jest.Mock).mockResolvedValue(item);
        const result = await repo.addOrderItem(1, item as any);
        expect(prisma.orderItem.create).toHaveBeenCalledWith({ data: { orderId: 1, productVariantId: 2, quantity: 3, price: 10 } });
        expect(result).toEqual(item);
    });

    it('updateOrderItem met à jour un item', async () => {
        (prisma.orderItem.update as jest.Mock).mockResolvedValue(item);
        const result = await repo.updateOrderItem(1, { quantity: 5 });
        expect(prisma.orderItem.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { quantity: 5 } });
        expect(result).toEqual(item);
    });

    it('deleteOrderItem supprime un item', async () => {
        (prisma.orderItem.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteOrderItem(1);
        expect(prisma.orderItem.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne un item', async () => {
        (prisma.orderItem.findUnique as jest.Mock).mockResolvedValue(item);
        const result = await repo.findById(1);
        expect(prisma.orderItem.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(item);
    });

    it('listItemsByOrder retourne les items de la commande', async () => {
        (prisma.orderItem.findMany as jest.Mock).mockResolvedValue([item]);
        const result = await repo.listItemsByOrder(1);
        expect(prisma.orderItem.findMany).toHaveBeenCalledWith({ where: { orderId: 1 } });
        expect(result).toEqual([item]);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.orderItem.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.addOrderItem(1, item as any)).rejects.toThrow('fail');
    });
}); 