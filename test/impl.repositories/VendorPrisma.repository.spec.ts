import { VendorPrismaRepository } from '../../src/infrastructure/impl.repositories/VendorPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        vendor: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        shop: {
            findMany: jest.fn(),
        },
    },
}));

describe('VendorPrismaRepository', () => {
    let repo: VendorPrismaRepository;
    const vendor = { id: 1, userId: 1 };
    const shop = { id: 2, vendorId: 1 };

    beforeEach(() => {
        repo = new VendorPrismaRepository();
        jest.clearAllMocks();
    });

    it('createVendor crée un vendor', async () => {
        (prisma.vendor.create as jest.Mock).mockResolvedValue(vendor);
        const result = await repo.createVendor(1);
        expect(prisma.vendor.create).toHaveBeenCalledWith({ data: { userId: 1 } });
        expect(result).toEqual(vendor);
    });

    it('findByUserId retourne un vendor', async () => {
        (prisma.vendor.findUnique as jest.Mock).mockResolvedValue(vendor);
        const result = await repo.findByUserId(1);
        expect(prisma.vendor.findUnique).toHaveBeenCalledWith({ where: { userId: 1 }, include: { shops: true } });
        expect(result).toEqual(vendor);
    });

    it('listVendors retourne la liste', async () => {
        (prisma.vendor.findMany as jest.Mock).mockResolvedValue([vendor]);
        const result = await repo.listVendors();
        expect(prisma.vendor.findMany).toHaveBeenCalled();
        expect(result).toEqual([vendor]);
    });

    it('getVendorShops retourne les shops', async () => {
        (prisma.shop.findMany as jest.Mock).mockResolvedValue([shop]);
        const result = await repo.getVendorShops(1);
        expect(prisma.shop.findMany).toHaveBeenCalledWith({ where: { vendorId: 1 } });
        expect(result).toEqual([shop]);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.vendor.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createVendor(1)).rejects.toThrow('fail');
    });
}); 