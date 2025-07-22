import { ShopPrismaRepository } from '../../src/infrastructure/impl.repositories/ShopPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        shop: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        subsite: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        shopSubscription: {
            create: jest.fn(),
        },
        order: {
            findMany: jest.fn(),
        },
        payment: {
            findMany: jest.fn(),
        },
        refund: {
            findMany: jest.fn(),
        },
        review: {
            findMany: jest.fn(),
        },
    },
}));

describe('ShopPrismaRepository', () => {
    let repo: ShopPrismaRepository;
    const shop = { id: 1, name: 'Shop', vendorId: 2 };
    const subsite = { id: 1, shopId: 1 };
    const subscription = { id: 1, shopId: 1, subscriptionId: 2 };
    const order = { id: 1, shopId: 1 };
    const payment = { id: 1, orderId: 1 };
    const refund = { id: 1, orderId: 1 };
    const review = { id: 1, productVariantId: 2 };

    beforeEach(() => {
        repo = new ShopPrismaRepository();
        jest.clearAllMocks();
    });

    it('createShop crée un shop', async () => {
        (prisma.shop.create as jest.Mock).mockResolvedValue(shop);
        const result = await repo.createShop(shop as any);
        expect(prisma.shop.create).toHaveBeenCalledWith({ data: shop });
        expect(result).toEqual(shop);
    });

    it('updateShop met à jour un shop', async () => {
        (prisma.shop.update as jest.Mock).mockResolvedValue(shop);
        const result = await repo.updateShop(1, { name: 'New' });
        expect(prisma.shop.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'New' } });
        expect(result).toEqual(shop);
    });

    it('deleteShop supprime un shop', async () => {
        (prisma.shop.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteShop(1);
        expect(prisma.shop.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne un shop', async () => {
        (prisma.shop.findUnique as jest.Mock).mockResolvedValue(shop);
        const result = await repo.findById(1);
        expect(prisma.shop.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { vendor: true } });
        expect(result).toEqual(shop);
    });

    it('listAllShops retourne une liste', async () => {
        (prisma.shop.findMany as jest.Mock).mockResolvedValue([shop]);
        const result = await repo.listAllShops({ vendorId: 2 });
        expect(prisma.shop.findMany).toHaveBeenCalledWith({ where: { vendorId: 2 } });
        expect(result).toEqual([shop]);
    });

    it('listActiveShopsWithProducts retourne les shops actifs', async () => {
        (prisma.shop.findMany as jest.Mock).mockResolvedValue([shop]);
        const result = await repo.listActiveShopsWithProducts();
        expect(prisma.shop.findMany).toHaveBeenCalledWith({
            where: {
                shopSubscriptions: {
                    some: {
                        OR: [
                            { endDate: null },
                            { endDate: { gt: expect.any(Date) } },
                        ],
                    },
                },
            },
            include: { products: true },
        });
        expect(result).toEqual([shop]);
    });

    it('getShopSubsite retourne le subsite', async () => {
        (prisma.subsite.findFirst as jest.Mock).mockResolvedValue(subsite);
        const result = await repo.getShopSubsite(1);
        expect(prisma.subsite.findFirst).toHaveBeenCalledWith({ where: { shopId: 1 } });
        expect(result).toEqual(subsite);
    });

    it('updateShopSubsite met à jour le subsite', async () => {
        (prisma.subsite.findFirst as jest.Mock).mockResolvedValue(subsite);
        (prisma.subsite.update as jest.Mock).mockResolvedValue(subsite);
        const result = await repo.updateShopSubsite(1, { config: 'x' } as any);
        expect(prisma.subsite.findFirst).toHaveBeenCalledWith({ where: { shopId: 1 } });
        expect(prisma.subsite.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { config: 'x' } });
        expect(result).toEqual(subsite);
    });

    it('updateShopSubsite lève une erreur si subsite non trouvé', async () => {
        (prisma.subsite.findFirst as jest.Mock).mockResolvedValue(null);
        await expect(repo.updateShopSubsite(1, { config: 'x' } as any)).rejects.toThrow('Subsite not found');
    });

    it('subscribeToPlan crée un abonnement', async () => {
        (prisma.shopSubscription.create as jest.Mock).mockResolvedValue(subscription);
        const result = await repo.subscribeToPlan(1, 2);
        expect(prisma.shopSubscription.create).toHaveBeenCalledWith({ data: { shopId: 1, subscriptionId: 2 } });
        expect(result).toEqual(subscription);
    });

    it('getShopOrders retourne les commandes', async () => {
        (prisma.order.findMany as jest.Mock).mockResolvedValue([order]);
        const result = await repo.getShopOrders(1);
        expect(prisma.order.findMany).toHaveBeenCalledWith({ where: { shopId: 1 } });
        expect(result).toEqual([order]);
    });

    it('getShopPayments retourne les paiements', async () => {
        (prisma.payment.findMany as jest.Mock).mockResolvedValue([payment]);
        const result = await repo.getShopPayments(1);
        expect(prisma.payment.findMany).toHaveBeenCalledWith({ where: { order: { shopId: 1 } } });
        expect(result).toEqual([payment]);
    });

    it('getShopRefunds retourne les refunds', async () => {
        (prisma.refund.findMany as jest.Mock).mockResolvedValue([refund]);
        const result = await repo.getShopRefunds(1);
        expect(prisma.refund.findMany).toHaveBeenCalledWith({ where: { order: { shopId: 1 } } });
        expect(result).toEqual([refund]);
    });

    it('getShopReviews retourne les reviews', async () => {
        (prisma.review.findMany as jest.Mock).mockResolvedValue([review]);
        const result = await repo.getShopReviews(1);
        expect(prisma.review.findMany).toHaveBeenCalledWith({ where: { productVariant: { product: { shopId: 1 } } } });
        expect(result).toEqual([review]);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.shop.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createShop(shop as any)).rejects.toThrow('fail');
    });
}); 