import { ProductImagePrismaRepository } from '../../src/infrastructure/impl.repositories/ProductImagePrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        productImage: {
            create: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('ProductImagePrismaRepository', () => {
    let repo: ProductImagePrismaRepository;
    const img = { id: 1, productVariantId: 2, url: 'img.png' };

    beforeEach(() => {
        repo = new ProductImagePrismaRepository();
        jest.clearAllMocks();
    });

    it('addImage ajoute une image', async () => {
        (prisma.productImage.create as jest.Mock).mockResolvedValue(img);
        const result = await repo.addImage(2, 'img.png');
        expect(prisma.productImage.create).toHaveBeenCalledWith({ data: { productVariantId: 2, url: 'img.png' } });
        expect(result).toEqual(img);
    });

    it('deleteImage supprime une image', async () => {
        (prisma.productImage.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteImage(1);
        expect(prisma.productImage.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('listImagesByVariant retourne les images', async () => {
        (prisma.productImage.findMany as jest.Mock).mockResolvedValue([img]);
        const result = await repo.listImagesByVariant(2);
        expect(prisma.productImage.findMany).toHaveBeenCalledWith({ where: { productVariantId: 2 } });
        expect(result).toEqual([img]);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.productImage.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.addImage(2, 'img.png')).rejects.toThrow('fail');
    });
}); 