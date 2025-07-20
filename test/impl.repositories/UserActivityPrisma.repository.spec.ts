import { UserActivityPrismaRepository } from '../../src/infrastructure/impl.repositories/UserActivityPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        userActivity: {
            create: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        product: { findMany: jest.fn() },
        order: { findMany: jest.fn() },
    },
}));

describe('UserActivityPrismaRepository', () => {
    let repo: UserActivityPrismaRepository;
    const activity = { id: 1, userId: 1, action: 'LOGIN' };

    beforeEach(() => {
        repo = new UserActivityPrismaRepository();
        jest.clearAllMocks();
    });

    it('logActivity crée une activité', async () => {
        (prisma.userActivity.create as jest.Mock).mockResolvedValue(activity);
        const result = await repo.logActivity(activity as any);
        expect(prisma.userActivity.create).toHaveBeenCalledWith({ data: activity });
        expect(result).toEqual(activity);
    });

    it('listActivities retourne une liste', async () => {
        (prisma.userActivity.findMany as jest.Mock).mockResolvedValue([activity]);
        const result = await repo.listActivities({ userId: 1 });
        expect(prisma.userActivity.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(result).toEqual([activity]);
    });

    it('getShopActivities retourne les activités du shop', async () => {
        (prisma.product.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
        (prisma.order.findMany as jest.Mock).mockResolvedValue([{ id: 2 }]);
        (prisma.userActivity.findMany as jest.Mock).mockResolvedValue([activity]);
        const result = await repo.getShopActivities(1);
        expect(prisma.product.findMany).toHaveBeenCalledWith({ where: { shopId: 1 }, select: { id: true } });
        expect(prisma.order.findMany).toHaveBeenCalledWith({ where: { shopId: 1 }, select: { id: true } });
        expect(prisma.userActivity.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { productId: { in: [1] } },
                    { orderId: { in: [2] } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        expect(result).toEqual([activity]);
    });

    it('findByUserId retourne les activités par user', async () => {
        (prisma.userActivity.findMany as jest.Mock).mockResolvedValue([activity]);
        const result = await repo.findByUserId(1);
        expect(prisma.userActivity.findMany).toHaveBeenCalledWith({ where: { userId: 1 }, orderBy: { createdAt: 'desc' } });
        expect(result).toEqual([activity]);
    });

    it('deleteByUserId supprime les activités par user', async () => {
        (prisma.userActivity.deleteMany as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteByUserId(1);
        expect(prisma.userActivity.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.userActivity.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.logActivity(activity as any)).rejects.toThrow('fail');
    });
}); 