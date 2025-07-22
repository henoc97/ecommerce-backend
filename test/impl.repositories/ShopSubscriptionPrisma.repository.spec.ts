import { ShopSubscriptionPrismaRepository } from '../../src/infrastructure/impl.repositories/ShopSubscriptionPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        shopSubscription: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('ShopSubscriptionPrismaRepository', () => {
    let repo: ShopSubscriptionPrismaRepository;
    const sub = { id: 1, shopId: 1, subscriptionId: 2 };

    beforeEach(() => {
        repo = new ShopSubscriptionPrismaRepository();
        jest.clearAllMocks();
    });

    it('subscribe crée un abonnement', async () => {
        (prisma.shopSubscription.create as jest.Mock).mockResolvedValue(sub);
        const result = await repo.subscribe(1, 2, undefined, undefined);
        expect(prisma.shopSubscription.create).toHaveBeenCalledWith({ data: { shopId: 1, subscriptionId: 2, startDate: undefined, endDate: undefined } });
        expect(result).toEqual(sub);
    });

    it('getActiveSubscriptions retourne les abonnements actifs', async () => {
        (prisma.shopSubscription.findMany as jest.Mock).mockResolvedValue([sub]);
        const result = await repo.getActiveSubscriptions();
        expect(prisma.shopSubscription.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { endDate: null },
                    { endDate: { gt: expect.any(Date) } },
                ],
            },
        });
        expect(result).toEqual([sub]);
    });

    it('getExpiredSubscriptions retourne les abonnements expirés', async () => {
        (prisma.shopSubscription.findMany as jest.Mock).mockResolvedValue([sub]);
        const result = await repo.getExpiredSubscriptions();
        expect(prisma.shopSubscription.findMany).toHaveBeenCalledWith({
            where: { endDate: { lte: expect.any(Date) } },
        });
        expect(result).toEqual([sub]);
    });

    it('getShopSubscriptions retourne les abonnements du shop', async () => {
        (prisma.shopSubscription.findMany as jest.Mock).mockResolvedValue([sub]);
        const result = await repo.getShopSubscriptions(1);
        expect(prisma.shopSubscription.findMany).toHaveBeenCalledWith({ where: { shopId: 1 } });
        expect(result).toEqual([sub]);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.shopSubscription.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.subscribe(1, 2)).rejects.toThrow('fail');
    });
}); 