import { PromotionPrismaRepository } from '../../src/infrastructure/impl.repositories/PromotionPrisma.repository';
import prisma from '../../prisma/client/prisma.service';
import { DiscountType } from '../../src/domain/enums/DiscountType.enum';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        promotion: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
            fields: { endDate: 'endDate' },
        },
        product: { findUnique: jest.fn() },
        productVariant: { findUnique: jest.fn() },
    },
}));

describe('PromotionPrismaRepository', () => {
    let repo: PromotionPrismaRepository;
    const promo = { id: 1, discountType: DiscountType.PERCENTAGE, discountValue: 10, productVariantId: 2 };

    beforeEach(() => {
        repo = new PromotionPrismaRepository();
        jest.clearAllMocks();
    });

    it('addPromotion crée une promotion', async () => {
        (prisma.promotion.create as jest.Mock).mockResolvedValue(promo);
        const result = await repo.addPromotion(promo as any);
        expect(prisma.promotion.create).toHaveBeenCalledWith({ data: promo });
        expect(result).toEqual(promo);
    });

    it('updatePromotion met à jour une promotion', async () => {
        (prisma.promotion.update as jest.Mock).mockResolvedValue(promo);
        const result = await repo.updatePromotion(1, { discountValue: 20 });
        expect(prisma.promotion.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { discountValue: 20 } });
        expect(result).toEqual(promo);
    });

    it('deletePromotion supprime une promotion', async () => {
        (prisma.promotion.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deletePromotion(1);
        expect(prisma.promotion.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne une promotion', async () => {
        (prisma.promotion.findUnique as jest.Mock).mockResolvedValue(promo);
        const result = await repo.findById(1);
        expect(prisma.promotion.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(promo);
    });

    it('listPromotions retourne une liste', async () => {
        (prisma.promotion.findMany as jest.Mock).mockResolvedValue([promo]);
        const result = await repo.listPromotions({ discountType: DiscountType.PERCENTAGE });
        expect(prisma.promotion.findMany).toHaveBeenCalledWith({ where: { discountType: DiscountType.PERCENTAGE } });
        expect(result).toEqual([promo]);
    });

    it('getVariantPromotions retourne les promos d\'une variante', async () => {
        (prisma.promotion.findMany as jest.Mock).mockResolvedValue([promo]);
        const result = await repo.getVariantPromotions(2);
        expect(prisma.promotion.findMany).toHaveBeenCalledWith({ where: { productVariantId: 2 } });
        expect(result).toEqual([promo]);
    });

    it('detectAbusivePromotions retourne les promos abusives', async () => {
        (prisma.promotion.findMany as jest.Mock).mockResolvedValue([promo]);
        const result = await repo.detectAbusivePromotions();
        expect(prisma.promotion.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { AND: [{ discountType: DiscountType.PERCENTAGE }, { discountValue: { gt: 90 } }] },
                    { AND: [{ discountType: DiscountType.FIXED_AMOUNT }, { discountValue: { gt: 0 } }] },
                    { startDate: { gt: 'endDate' } },
                ],
            },
            include: { productVariant: { select: { price: true } } },
        });
        expect(result).toEqual([promo]);
    });

    it('deleteManyByProductVariantIds supprime plusieurs promos', async () => {
        (prisma.promotion.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
        const result = await repo.deleteManyByProductVariantIds([2, 3]);
        expect(prisma.promotion.deleteMany).toHaveBeenCalledWith({ where: { productVariantId: { in: [2, 3] } } });
        expect(result).toBe(2);
    });

    it('deleteManyByProductVariantId supprime les promos d\'une variante', async () => {
        (prisma.promotion.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
        const result = await repo.deleteManyByProductVariantId(2);
        expect(prisma.promotion.deleteMany).toHaveBeenCalledWith({ where: { productVariantId: 2 } });
        expect(result).toBe(1);
    });

    it('findPromotionWithOwnership retourne la promo avec ownership', async () => {
        (prisma.promotion.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
        const result = await repo.findPromotionWithOwnership(1);
        expect(prisma.promotion.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: {
                productVariant: {
                    include: {
                        product: {
                            include: {
                                shop: { include: { vendor: true } },
                            },
                        },
                    },
                },
            },
        });
        expect(result).toEqual({ id: 1 });
    });

    it('findProductWithOwnership retourne le produit avec ownership', async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue({ id: 2 });
        const result = await repo.findProductWithOwnership(2);
        expect(prisma.product.findUnique).toHaveBeenCalledWith({
            where: { id: 2 },
            include: { shop: { include: { vendor: true } } },
        });
        expect(result).toEqual({ id: 2 });
    });

    it('findVariantWithOwnership retourne la variante avec ownership', async () => {
        (prisma.productVariant.findUnique as jest.Mock).mockResolvedValue({ id: 3 });
        const result = await repo.findVariantWithOwnership(3);
        expect(prisma.productVariant.findUnique).toHaveBeenCalledWith({
            where: { id: 3 },
            include: { product: { include: { shop: { include: { vendor: true } } } } },
        });
        expect(result).toEqual({ id: 3 });
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.promotion.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.addPromotion(promo as any)).rejects.toThrow('fail');
    });
}); 