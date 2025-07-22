import { SubsitePrismaRepository } from '../../src/infrastructure/impl.repositories/SubsitePrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        subsite: {
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

describe('SubsitePrismaRepository', () => {
    let repo: SubsitePrismaRepository;
    const subsite = { id: 1, shopId: 2 };

    beforeEach(() => {
        repo = new SubsitePrismaRepository();
        jest.clearAllMocks();
    });

    it('createSubsite crée un subsite', async () => {
        (prisma.subsite.create as jest.Mock).mockResolvedValue(subsite);
        const result = await repo.createSubsite(subsite as any);
        expect(prisma.subsite.create).toHaveBeenCalledWith({ data: subsite });
        expect(result).toEqual(subsite);
    });

    it('updateSubsite met à jour un subsite', async () => {
        (prisma.subsite.update as jest.Mock).mockResolvedValue(subsite);
        const result = await repo.updateSubsite(1, { shopId: 2 });
        expect(prisma.subsite.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { shopId: 2 } });
        expect(result).toEqual(subsite);
    });

    it('findByShopId retourne un subsite', async () => {
        (prisma.subsite.findFirst as jest.Mock).mockResolvedValue(subsite);
        const result = await repo.findByShopId(2);
        expect(prisma.subsite.findFirst).toHaveBeenCalledWith({ where: { shopId: 2 } });
        expect(result).toEqual(subsite);
    });

    it('findById retourne un subsite', async () => {
        (prisma.subsite.findUnique as jest.Mock).mockResolvedValue(subsite);
        const result = await repo.findById(1);
        expect(prisma.subsite.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(subsite);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.subsite.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createSubsite(subsite as any)).rejects.toThrow('fail');
    });
}); 