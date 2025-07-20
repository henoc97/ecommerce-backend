import { CartItemPrismaRepository } from '../../src/infrastructure/impl.repositories/CartItemPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        cartItem: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('CartItemPrismaRepository', () => {
    let repo: CartItemPrismaRepository;
    const item = { id: 1, cartId: 1, productVariantId: 2, quantity: 3 };

    beforeEach(() => {
        repo = new CartItemPrismaRepository();
        jest.clearAllMocks();
    });

    it('addItem ajoute un item', async () => {
        (prisma.cartItem.create as jest.Mock).mockResolvedValue(item);
        const result = await repo.addItem(1, 2, 3);
        expect(prisma.cartItem.create).toHaveBeenCalledWith({ data: { cartId: 1, productVariantId: 2, quantity: 3 } });
        expect(result).toEqual(item);
    });

    it('updateItemQuantity met à jour la quantité', async () => {
        (prisma.cartItem.update as jest.Mock).mockResolvedValue(item);
        const result = await repo.updateItemQuantity(1, 3);
        expect(prisma.cartItem.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { quantity: 3 } });
        expect(result).toEqual(item);
    });

    it('deleteItem supprime un item', async () => {
        (prisma.cartItem.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteItem(1);
        expect(prisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne un item', async () => {
        (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(item);
        const result = await repo.findById(1);
        expect(prisma.cartItem.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(item);
    });

    it('findByCartIdAndProductId retourne un item', async () => {
        (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(item);
        const result = await repo.findByCartIdAndProductId(1, 2);
        expect(prisma.cartItem.findFirst).toHaveBeenCalledWith({ where: { AND: { cartId: 1, productVariantId: 2 } } });
        expect(result).toEqual(item);
    });

    it('listItemsByCart retourne les items du panier', async () => {
        (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([item]);
        const result = await repo.listItemsByCart(1);
        expect(prisma.cartItem.findMany).toHaveBeenCalledWith({ where: { cartId: 1 } });
        expect(result).toEqual([item]);
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.cartItem.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.addItem(1, 2, 3)).rejects.toThrow('fail');
    });
}); 