import { ProductPrismaRepository } from '../../src/infrastructure/impl.repositories/ProductPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        product: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        productVariant: {
            findMany: jest.fn(),
        },
    },
}));

describe('ProductPrismaRepository', () => {
    let repo: ProductPrismaRepository;
    const product = { id: 1, name: 'Prod', shopId: 2 };
    const variant = { id: 2, productId: 1 };
    const category = { id: 3, name: 'Cat' };

    beforeEach(() => {
        repo = new ProductPrismaRepository();
        jest.clearAllMocks();
    });

    it('createProduct crée un produit', async () => {
        (prisma.product.create as jest.Mock).mockResolvedValue(product);
        const result = await repo.createProduct(product as any);
        expect(prisma.product.create).toHaveBeenCalledWith({ data: product });
        expect(result).toEqual(product);
    });

    it('updateProduct met à jour un produit', async () => {
        (prisma.product.update as jest.Mock).mockResolvedValue(product);
        const result = await repo.updateProduct(1, { name: 'New' });
        expect(prisma.product.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'New' } });
        expect(result).toEqual(product);
    });

    it('deleteProduct supprime un produit', async () => {
        (prisma.product.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteProduct(1);
        expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne un produit', async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue(product);
        const result = await repo.findById(1);
        expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { shop: true } });
        expect(result).toEqual(product);
    });

    it('getProductWithVariantsImages retourne le produit avec variants/images', async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue(product);
        const result = await repo.getProductWithVariantsImages(1);
        expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { category: true, productVariants: { include: { productImages: true, promotions: true } } } });
        expect(result).toEqual(product);
    });

    it('listProducts retourne une liste', async () => {
        (prisma.product.findMany as jest.Mock).mockResolvedValue([product]);
        const result = await repo.listProducts({ shopId: 2 });
        expect(prisma.product.findMany).toHaveBeenCalledWith({ where: { shopId: 2 } });
        expect(result).toEqual([product]);
    });

    it('getProductVariants retourne les variants', async () => {
        (prisma.productVariant.findMany as jest.Mock).mockResolvedValue([variant]);
        const result = await repo.getProductVariants(1);
        expect(prisma.productVariant.findMany).toHaveBeenCalledWith({ where: { productId: 1 } });
        expect(result).toEqual([variant]);
    });

    it('getProductCategory retourne la catégorie', async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue({ category });
        const result = await repo.getProductCategory(1);
        expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { category: true } });
        expect(result).toEqual(category);
    });

    it('hasProductRelations retourne true si relations', async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue({ productVariants: [{ orderItems: [{}], reviews: [] }] });
        const result = await repo.hasProductRelations(1);
        expect(result).toBe(true);
    });

    it('hasProductRelations retourne false si aucune relation', async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValue({ productVariants: [{ orderItems: [], reviews: [] }] });
        const result = await repo.hasProductRelations(1);
        expect(result).toBe(false);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.product.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createProduct(product as any)).rejects.toThrow('fail');
    });
}); 