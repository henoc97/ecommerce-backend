import { ProductVariantPrismaRepository } from '../../src/infrastructure/impl.repositories/ProductVariantPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        productVariant: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        productImage: {
            findMany: jest.fn(),
        },
        promotion: {
            findMany: jest.fn(),
        },
    },
}));

describe('ProductVariantPrismaRepository', () => {
    let repo: ProductVariantPrismaRepository;
    const variant = { id: 1, productId: 2, stock: 10, price: 100 };
    const img = { id: 1, productVariantId: 1, url: 'img.png' };
    const promo = { id: 1, productVariantId: 1 };

    beforeEach(() => {
        repo = new ProductVariantPrismaRepository();
        jest.clearAllMocks();
    });

    it('createVariant crée une variante', async () => {
        (prisma.productVariant.create as jest.Mock).mockResolvedValue(variant);
        const result = await repo.createVariant(2, variant as any);
        expect(prisma.productVariant.create).toHaveBeenCalledWith({ data: { productId: 2, attributes: undefined, stock: 10, price: 100, currency: undefined } });
        expect(result).toEqual(variant);
    });

    it('updateVariant met à jour une variante', async () => {
        (prisma.productVariant.update as jest.Mock).mockResolvedValue(variant);
        const result = await repo.updateVariant(1, { stock: 5 });
        expect(prisma.productVariant.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { stock: 5 } });
        expect(result).toEqual(variant);
    });

    it('deleteVariant supprime une variante', async () => {
        (prisma.productVariant.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteVariant(1);
        expect(prisma.productVariant.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne une variante', async () => {
        (prisma.productVariant.findUnique as jest.Mock).mockResolvedValue(variant);
        const result = await repo.findById(1);
        expect(prisma.productVariant.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(variant);
    });

    it('listVariants retourne les variantes du produit', async () => {
        (prisma.productVariant.findMany as jest.Mock).mockResolvedValue([variant]);
        const result = await repo.listVariants(2);
        expect(prisma.productVariant.findMany).toHaveBeenCalledWith({ where: { productId: 2 } });
        expect(result).toEqual([variant]);
    });

    it('setStock met à jour le stock', async () => {
        (prisma.productVariant.update as jest.Mock).mockResolvedValue(undefined);
        await repo.setStock(1, 5);
        expect(prisma.productVariant.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { stock: 5 } });
    });

    it('setPrice met à jour le prix', async () => {
        (prisma.productVariant.update as jest.Mock).mockResolvedValue(undefined);
        await repo.setPrice(1, 200);
        expect(prisma.productVariant.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { price: 200 } });
    });

    it('getVariantImages retourne les images', async () => {
        (prisma.productImage.findMany as jest.Mock).mockResolvedValue([img]);
        const result = await repo.getVariantImages(1);
        expect(prisma.productImage.findMany).toHaveBeenCalledWith({ where: { productVariantId: 1 } });
        expect(result).toEqual([img]);
    });

    it('getVariantPromotions retourne les promos', async () => {
        (prisma.promotion.findMany as jest.Mock).mockResolvedValue([promo]);
        const result = await repo.getVariantPromotions(1);
        expect(prisma.promotion.findMany).toHaveBeenCalledWith({ where: { productVariantId: 1 } });
        expect(result).toEqual([promo]);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.productVariant.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createVariant(2, variant as any)).rejects.toThrow('fail');
    });
}); 