import { CartPrismaRepository } from '../../src/infrastructure/impl.repositories/CartPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        cart: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
            updateMany: jest.fn(),
        },
        cartItem: {
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        shop: { findMany: jest.fn() },
    },
}));

describe('CartPrismaRepository', () => {
    let repo: CartPrismaRepository;
    const cart = { id: 1, userId: 1, shopId: 2 };
    const item = { id: 1, cartId: 1, productVariantId: 2, quantity: 3 };

    beforeEach(() => {
        repo = new CartPrismaRepository();
        jest.clearAllMocks();
    });

    it('createCart crée un panier', async () => {
        (prisma.cart.create as jest.Mock).mockResolvedValue(cart);
        const result = await repo.createCart(1, 2);
        expect(prisma.cart.create).toHaveBeenCalledWith({ data: { userId: 1, shopId: 2 } });
        expect(result).toEqual(cart);
    });

    it('findByUserIdAndShopId retourne un panier', async () => {
        (prisma.cart.findFirst as jest.Mock).mockResolvedValue(cart);
        const result = await repo.findByUserIdAndShopId(1, 2);
        expect(prisma.cart.findFirst).toHaveBeenCalledWith({ where: { userId: 1, shopId: 2 } });
        expect(result).toEqual(cart);
    });

    it('getCartDetails retourne les détails du panier', async () => {
        (prisma.cart.findUnique as jest.Mock).mockResolvedValue(cart);
        const result = await repo.getCartDetails(1);
        expect(prisma.cart.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { items: true, shop: true } });
        expect(result).toEqual(cart);
    });

    it('listCartsByUser retourne les paniers', async () => {
        (prisma.cart.findMany as jest.Mock).mockResolvedValue([cart]);
        const result = await repo.listCartsByUser(1);
        expect(prisma.cart.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(result).toEqual([cart]);
    });

    it('getCartItems retourne les items du panier', async () => {
        (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([item]);
        const result = await repo.getCartItems(1);
        expect(prisma.cartItem.findMany).toHaveBeenCalledWith({ where: { cartId: 1 } });
        expect(result).toEqual([item]);
    });

    it('updateCartTotals met à jour les totaux', async () => {
        (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([{ quantity: 2, productVariant: { price: 10 } }]);
        (prisma.cart.update as jest.Mock).mockResolvedValue(undefined);
        await repo.updateCartTotals(1);
        expect(prisma.cartItem.findMany).toHaveBeenCalledWith({ where: { cartId: 1 }, include: { productVariant: true } });
        expect(prisma.cart.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { totalQuantity: 2, totalPrice: 20 } });
    });

    it('deleteCart supprime un panier', async () => {
        (prisma.cart.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteCart(1);
        expect(prisma.cart.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findByUserId retourne les paniers par user', async () => {
        (prisma.cart.findMany as jest.Mock).mockResolvedValue([cart]);
        const result = await repo.findByUserId(1);
        expect(prisma.cart.findMany).toHaveBeenCalledWith({ where: { userId: 1 }, include: { items: true, shop: true } });
        expect(result).toEqual([cart]);
    });

    it('deleteByUserId supprime les paniers et items', async () => {
        (prisma.cart.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
        (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue(undefined);
        (prisma.cart.deleteMany as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteByUserId(1);
        expect(prisma.cart.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 1 } });
        expect(prisma.cart.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.cart.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createCart(1, 2)).rejects.toThrow('fail');
    });
}); 