import prisma from '../../../prisma/client/prisma.service';
import { CartEntity } from '../../domain/entities/Cart.entity';
import { CartItemEntity } from '../../domain/entities/CartItem.entity';
import { ICartRepository } from '../../domain/repositories/Cart.repository';

export class CartPrismaRepository implements ICartRepository {
    async createCart(userId: number, shopId: number): Promise<CartEntity> {
        try {
            return await prisma.cart.create({ data: { userId, shopId } }) as CartEntity;
        } catch (error) {
            throw error;
        }
    }
    async findByUserIdAndShopId(userId: number, shopId: number): Promise<CartEntity> {
        try {
            return await prisma.cart.findFirst({ where: { userId, shopId } }) as CartEntity;
        } catch (error) {
            throw error;
        }
    }
    async listCartsByUser(userId: number): Promise<CartEntity[]> {
        try {
            return await prisma.cart.findMany({ where: { userId } }) as CartEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getCartItems(cartId: number): Promise<CartItemEntity[]> {
        try {
            return await prisma.cartItem.findMany({ where: { cartId } }) as CartItemEntity[];
        } catch (error) {
            throw error;
        }
    }
    async updateCartTotals(cartId: number): Promise<void> {
        try {
            // À adapter selon la logique métier réelle
            const items = await prisma.cartItem.findMany({ where: { cartId } });
            const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
            // Suppose que chaque item a un champ price (sinon adapter)
            const totalPrice = items.reduce((sum: number, item: any) => sum + (item['price'] || 0) * item.quantity, 0);
            await prisma.cart.update({ where: { id: cartId }, data: { totalQuantity, totalPrice } });
        } catch (error) {
            throw error;
        }
    }
    async deleteCart(cartId: number): Promise<void> {
        try {
            await prisma.cart.delete({ where: { id: cartId } });
        } catch (error) {
            throw error;
        }
    }
} 