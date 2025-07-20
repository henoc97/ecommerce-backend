import { CategoryPrismaRepository } from '../../src/infrastructure/impl.repositories/CategoryPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        category: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('CategoryPrismaRepository', () => {
    let repo: CategoryPrismaRepository;
    const category = { id: 1, name: 'Cat', shopId: 2, products: [{ id: 10 }] };
    const product = { id: 10, name: 'Prod' };

    beforeEach(() => {
        repo = new CategoryPrismaRepository();
        jest.clearAllMocks();
    });

    it('createCategory crée une catégorie', async () => {
        (prisma.category.create as jest.Mock).mockResolvedValue(category);
        const result = await repo.createCategory(category as any);
        expect(prisma.category.create).toHaveBeenCalledWith({ data: category });
        expect(result).toEqual(category);
    });

    it('updateCategory met à jour une catégorie', async () => {
        (prisma.category.update as jest.Mock).mockResolvedValue(category);
        const result = await repo.updateCategory(1, { name: 'New' });
        expect(prisma.category.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'New' } });
        expect(result).toEqual(category);
    });

    it('deleteCategory supprime une catégorie', async () => {
        (prisma.category.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteCategory(1);
        expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne une catégorie', async () => {
        (prisma.category.findUnique as jest.Mock).mockResolvedValue(category);
        const result = await repo.findById(1);
        expect(prisma.category.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(category);
    });

    it('listCategories retourne une liste', async () => {
        (prisma.category.findMany as jest.Mock).mockResolvedValue([category]);
        const result = await repo.listCategories(2);
        expect(prisma.category.findMany).toHaveBeenCalledWith({ where: { shopId: 2 } });
        expect(result).toEqual([category]);
    });

    it('listProductsByCategory retourne les produits', async () => {
        (prisma.category.findMany as jest.Mock).mockResolvedValue([{ ...category, products: [product] }]);
        const result = await repo.listProductsByCategory('Cat');
        expect(prisma.category.findMany).toHaveBeenCalledWith({
            where: { name: { contains: 'Cat', mode: 'insensitive' } },
            include: { products: true },
        });
        expect(result).toEqual([product]);
    });

    it('getShopProductsByCategory retourne les produits du shop', async () => {
        (prisma.category.findMany as jest.Mock).mockResolvedValue([{ ...category, products: [product] }]);
        const result = await repo.getShopProductsByCategory(2, 'Cat');
        expect(prisma.category.findMany).toHaveBeenCalledWith({
            where: { name: { contains: 'Cat', mode: 'insensitive' }, shopId: 2 },
            include: { products: true },
        });
        expect(result).toEqual([product]);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.category.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createCategory(category as any)).rejects.toThrow('fail');
    });
}); 