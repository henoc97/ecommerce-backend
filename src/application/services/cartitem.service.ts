import { Injectable, Inject } from '@nestjs/common';
import { CartItemPrismaRepository } from '../../infrastructure/impl.repositories/CartItemPrisma.repository';
import { CartItemEntity } from '../../domain/entities/CartItem.entity';

@Injectable()
export class CartItemService {
    constructor(
        @Inject(CartItemPrismaRepository) private readonly repository: CartItemPrismaRepository,
    ) { }

    async addItem(cartId: number, productVariantId: number, quantity: number) {
        try {
            return await this.repository.addItem(cartId, productVariantId, quantity);
        } catch (error) {
            throw error;
        }
    }
    async updateItemQuantity(id: number, quantity: number) {
        try {
            return await this.repository.updateItemQuantity(id, quantity);
        } catch (error) {
            throw error;
        }
    }
    async deleteItem(id: number) {
        try {
            return await this.repository.deleteItem(id);
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number) {
        try {
            return await this.repository.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async listItemsByCart(cartId: number) {
        try {
            return await this.repository.listItemsByCart(cartId);
        } catch (error) {
            throw error;
        }
    }
} 