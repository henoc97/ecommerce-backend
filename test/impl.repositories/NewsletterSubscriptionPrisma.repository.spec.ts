import { NewsletterSubscriptionPrismaRepository } from '../../src/infrastructure/impl.repositories/NewsletterSubscriptionPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        newsletterSubscription: {
            create: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        user: { findUnique: jest.fn() },
    },
}));

describe('NewsletterSubscriptionPrismaRepository', () => {
    let repo: NewsletterSubscriptionPrismaRepository;
    const sub = { id: 1, email: 'a@b.com', shopId: 2 };

    beforeEach(() => {
        repo = new NewsletterSubscriptionPrismaRepository();
        jest.clearAllMocks();
    });

    it('subscribe ajoute un abonnement', async () => {
        (prisma.newsletterSubscription.create as jest.Mock).mockResolvedValue(sub);
        const result = await repo.subscribe('a@b.com', 2);
        expect(prisma.newsletterSubscription.create).toHaveBeenCalledWith({ data: { email: 'a@b.com', shopId: 2 } });
        expect(result).toEqual(sub);
    });

    it('unsubscribe supprime un abonnement', async () => {
        (prisma.newsletterSubscription.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.unsubscribe('a@b.com', 2);
        expect(prisma.newsletterSubscription.delete).toHaveBeenCalledWith({ where: { email_shopId: { email: 'a@b.com', shopId: 2 } } });
    });

    it('checkSubscriptionStatus retourne true si abonné', async () => {
        (prisma.newsletterSubscription.findUnique as jest.Mock).mockResolvedValue(sub);
        const result = await repo.checkSubscriptionStatus('a@b.com', 2);
        expect(prisma.newsletterSubscription.findUnique).toHaveBeenCalledWith({ where: { email_shopId: { email: 'a@b.com', shopId: 2 } } });
        expect(result).toBe(true);
    });

    it('checkSubscriptionStatus retourne false si non abonné', async () => {
        (prisma.newsletterSubscription.findUnique as jest.Mock).mockResolvedValue(null);
        const result = await repo.checkSubscriptionStatus('a@b.com', 2);
        expect(result).toBe(false);
    });

    it('listSubscribers retourne les abonnés', async () => {
        (prisma.newsletterSubscription.findMany as jest.Mock).mockResolvedValue([sub]);
        const result = await repo.listSubscribers(2);
        expect(prisma.newsletterSubscription.findMany).toHaveBeenCalledWith({ where: { shopId: 2 } });
        expect(result).toEqual([sub]);
    });

    it('findByUserId retourne les abonnements par user', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'a@b.com' });
        (prisma.newsletterSubscription.findMany as jest.Mock).mockResolvedValue([sub]);
        const result = await repo.findByUserId(1);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, select: { email: true } });
        expect(prisma.newsletterSubscription.findMany).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
        expect(result).toEqual([sub]);
    });

    it('findByUserId retourne [] si user non trouvé', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        const result = await repo.findByUserId(1);
        expect(result).toEqual([]);
    });

    it('deleteByUserId supprime les abonnements par user', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'a@b.com' });
        (prisma.newsletterSubscription.deleteMany as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteByUserId(1);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, select: { email: true } });
        expect(prisma.newsletterSubscription.deleteMany).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
    });

    it('deleteByUserId ne fait rien si user non trouvé', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        await repo.deleteByUserId(1);
        expect(prisma.newsletterSubscription.deleteMany).not.toHaveBeenCalled();
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.newsletterSubscription.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.subscribe('a@b.com', 2)).rejects.toThrow('fail');
    });
});
