import { AddressPrismaRepository } from '../../src/infrastructure/impl.repositories/AddressPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        address: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('AddressPrismaRepository', () => {
    let repo: AddressPrismaRepository;
    const address = { id: 1, userId: 1, street: '1 rue', city: 'Paris', country: 'FR' };

    beforeEach(() => {
        repo = new AddressPrismaRepository();
        jest.clearAllMocks();
    });

    it('createAddress crée une adresse', async () => {
        (prisma.address.create as jest.Mock).mockResolvedValue(address);
        const result = await repo.createAddress(address as any);
        expect(prisma.address.create).toHaveBeenCalledWith({ data: address });
        expect(result).toEqual(address);
    });

    it('updateAddress met à jour une adresse', async () => {
        (prisma.address.update as jest.Mock).mockResolvedValue(address);
        const result = await repo.updateAddress(1, address as any);
        expect(prisma.address.update).toHaveBeenCalledWith({ where: { userId: 1 }, data: address });
        expect(result).toEqual(address);
    });

    it('findByUserId retourne une adresse', async () => {
        (prisma.address.findUnique as jest.Mock).mockResolvedValue(address);
        const result = await repo.findByUserId(1);
        expect(prisma.address.findUnique).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(result).toEqual(address);
    });

    it('findAllAddresses retourne toutes les adresses', async () => {
        (prisma.address.findMany as jest.Mock).mockResolvedValue([address]);
        const result = await repo.findAllAddresses(1);
        expect(prisma.address.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(result).toEqual([address]);
    });

    it('deleteAddress supprime une adresse', async () => {
        (prisma.address.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteAddress(1);
        expect(prisma.address.delete).toHaveBeenCalledWith({ where: { userId: 1 } });
    });

    it('deleteByUserId supprime une adresse (alias)', async () => {
        (prisma.address.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteByUserId(1);
        expect(prisma.address.delete).toHaveBeenCalledWith({ where: { userId: 1 } });
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.address.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createAddress(address as any)).rejects.toThrow('fail');
    });
}); 