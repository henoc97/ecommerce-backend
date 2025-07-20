import { Injectable, Inject } from '@nestjs/common';
import { CartPrismaRepository } from '../../infrastructure/impl.repositories/CartPrisma.repository';

@Injectable()
export class CartService {
    constructor(
        @Inject(CartPrismaRepository) private readonly repository: CartPrismaRepository,
    ) { }

    async createCart(userId: number, shopId: number) {
        try {
            return await this.repository.createCart(userId, shopId);
        } catch (error) {
            throw error;
        }
    }
    async findByUserIdAndShopId(userId: number, shopId: number) {
        try {
            return await this.repository.findByUserIdAndShopId(userId, shopId);
        } catch (error) {
            throw error;
        }
    }
    async getCartDetails(id: number) {
        try {
            return await this.repository.getCartDetails(id);
        } catch (error) {
            throw error;
        }
    }
    async listCartsByUser(userId: number) {
        try {
            return await this.repository.listCartsByUser(userId);
        } catch (error) {
            throw error;
        }
    }
    async getCartItems(cartId: number) {
        try {
            return await this.repository.getCartItems(cartId);
        } catch (error) {
            throw error;
        }
    }
    async updateCartTotals(cartId: number) {
        try {
            return await this.repository.updateCartTotals(cartId);
        } catch (error) {
            throw error;
        }
    }
    async deleteCart(cartId: number) {
        try {
            return await this.repository.deleteCart(cartId);
        } catch (error) {
            throw error;
        }
    }

    // GDPR - Recherche et suppression par utilisateur
    async findByUserId(userId: number) {
        try {
            return await this.repository.findByUserId(userId);
        } catch (error) {
            throw error;
        }
    }

    async deleteByUserId(userId: number) {
        try {
            return await this.repository.deleteByUserId(userId);
        } catch (error) {
            throw error;
        }
    }
} 