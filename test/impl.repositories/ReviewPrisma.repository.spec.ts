import { ReviewPrismaRepository } from '../../src/infrastructure/impl.repositories/ReviewPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        review: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}));

describe('ReviewPrismaRepository', () => {
    let repo: ReviewPrismaRepository;
    const review = { id: 1, userId: 1, productVariantId: 2, rating: 5 };

    beforeEach(() => {
        repo = new ReviewPrismaRepository();
        jest.clearAllMocks();
    });

    it('createReview crée un review', async () => {
        (prisma.review.create as jest.Mock).mockResolvedValue(review);
        const result = await repo.createReview(review as any);
        expect(prisma.review.create).toHaveBeenCalledWith({ data: review });
        expect(result).toEqual(review);
    });

    it('updateReview met à jour un review', async () => {
        (prisma.review.update as jest.Mock).mockResolvedValue(review);
        const result = await repo.updateReview(1, { rating: 4 });
        expect(prisma.review.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { rating: 4 } });
        expect(result).toEqual(review);
    });

    it('deleteReview supprime un review', async () => {
        (prisma.review.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteReview(1);
        expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne un review', async () => {
        (prisma.review.findUnique as jest.Mock).mockResolvedValue(review);
        const result = await repo.findById(1);
        expect(prisma.review.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(review);
    });

    it('listReviews retourne une liste', async () => {
        (prisma.review.findMany as jest.Mock).mockResolvedValue([review]);
        const result = await repo.listReviews({ userId: 1 });
        expect(prisma.review.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(result).toEqual([review]);
    });

    it('getProductReviews retourne les reviews du produit', async () => {
        (prisma.review.findMany as jest.Mock).mockResolvedValue([review]);
        const result = await repo.getProductReviews(2);
        expect(prisma.review.findMany).toHaveBeenCalledWith({ where: { productVariant: { productId: 2 } } });
        expect(result).toEqual([review]);
    });

    it('getShopReviews retourne les reviews du shop', async () => {
        (prisma.review.findMany as jest.Mock).mockResolvedValue([review]);
        const result = await repo.getShopReviews(3);
        expect(prisma.review.findMany).toHaveBeenCalledWith({ where: { productVariant: { product: { shopId: 3 } } } });
        expect(result).toEqual([review]);
    });

    it('checkUserProductReview retourne un review', async () => {
        (prisma.review.findUnique as jest.Mock).mockResolvedValue(review);
        const result = await repo.checkUserProductReview(1, 2);
        expect(prisma.review.findUnique).toHaveBeenCalledWith({ where: { userId_productVariantId: { userId: 1, productVariantId: 2 } } });
        expect(result).toEqual(review);
    });

    it('findByUserId retourne les reviews par user', async () => {
        (prisma.review.findMany as jest.Mock).mockResolvedValue([review]);
        const result = await repo.findByUserId(1);
        expect(prisma.review.findMany).toHaveBeenCalledWith({ where: { userId: 1 }, include: { productVariant: true } });
        expect(result).toEqual([review]);
    });

    it('deleteByUserId supprime les reviews par user', async () => {
        (prisma.review.deleteMany as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteByUserId(1);
        expect(prisma.review.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.review.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createReview(review as any)).rejects.toThrow('fail');
    });
}); 