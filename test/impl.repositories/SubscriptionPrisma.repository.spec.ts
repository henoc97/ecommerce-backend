import { SubscriptionPrismaRepository } from '../../src/infrastructure/impl.repositories/SubscriptionPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        subscription: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('SubscriptionPrismaRepository', () => {
    let repo: SubscriptionPrismaRepository;
    const sub = { id: 1, name: 'Sub', price: 10 };

    beforeEach(() => {
        repo = new SubscriptionPrismaRepository();
        jest.clearAllMocks();
    });

    it('createSubscription crée un abonnement', async () => {
        (prisma.subscription.create as jest.Mock).mockResolvedValue(sub);
        const result = await repo.createSubscription(sub as any);
        expect(prisma.subscription.create).toHaveBeenCalledWith({ data: sub });
        expect(result).toEqual(sub);
    });

    it('updateSubscription met à jour un abonnement', async () => {
        (prisma.subscription.update as jest.Mock).mockResolvedValue(sub);
        const result = await repo.updateSubscription(1, { price: 20 });
        expect(prisma.subscription.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { price: 20 } });
        expect(result).toEqual(sub);
    });

    it('deleteSubscription supprime un abonnement', async () => {
        (prisma.subscription.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteSubscription(1);
        expect(prisma.subscription.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne un abonnement', async () => {
        (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(sub);
        const result = await repo.findById(1);
        expect(prisma.subscription.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(sub);
    });

    it('listSubscriptions retourne la liste', async () => {
        (prisma.subscription.findMany as jest.Mock).mockResolvedValue([sub]);
        const result = await repo.listSubscriptions();
        expect(prisma.subscription.findMany).toHaveBeenCalled();
        expect(result).toEqual([sub]);
    });

    it('getShopSubscriptions retourne les abonnements du shop', async () => {
        (prisma.subscription.findMany as jest.Mock).mockResolvedValue([sub]);
        const result = await repo.getShopSubscriptions(2);
        expect(prisma.subscription.findMany).toHaveBeenCalledWith({ where: { shopSubscriptions: { some: { shopId: 2 } } } });
        expect(result).toEqual([sub]);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.subscription.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createSubscription(sub as any)).rejects.toThrow('fail');
    });
}); 