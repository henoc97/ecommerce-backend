import prisma from '../../../prisma/client/prisma.service';
import { CartItemEntity } from '../../domain/entities/CartItem.entity';
import { ICartItemRepository } from '../../domain/repositories/CartItem.repository';

export class CartItemPrismaRepository implements ICartItemRepository {
    async addItem(cartId: number, productVariantId: number, quantity: number): Promise<CartItemEntity> {
        try {
            return await prisma.cartItem.create({ data: { cartId, productVariantId, quantity } }) as CartItemEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateItemQuantity(id: number, quantity: number): Promise<CartItemEntity> {
        try {
            return await prisma.cartItem.update({ where: { id }, data: { quantity } }) as CartItemEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteItem(id: number): Promise<void> {
        try {
            await prisma.cartItem.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<CartItemEntity> {
        try {
            return await prisma.cartItem.findUnique({ where: { id } }) as CartItemEntity;
        } catch (error) {
            throw error;
        }
    }
    async listItemsByCart(cartId: number): Promise<CartItemEntity[]> {
        try {
            return await prisma.cartItem.findMany({ where: { cartId } }) as CartItemEntity[];
        } catch (error) {
            throw error;
        }
    }
} 