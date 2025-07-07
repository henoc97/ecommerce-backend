import { Injectable, Inject } from '@nestjs/common';
import { ShopSubscriptionPrismaRepository } from '../../infrastructure/impl.repositories/ShopSubscriptionPrisma.repository';

@Injectable()
export class ShopSubscriptionService {
    constructor(
        @Inject(ShopSubscriptionPrismaRepository) private readonly repository: ShopSubscriptionPrismaRepository,
    ) { }

    async subscribe(shopId: number, subscriptionId: number) {
        try {
            return await this.repository.subscribe(shopId, subscriptionId);
        } catch (error) {
            throw error;
        }
    }

    async getActiveSubscriptions() {
        try {
            return await this.repository.getActiveSubscriptions();
        } catch (error) {
            throw error;
        }
    }

    async getExpiredSubscriptions() {
        try {
            return await this.repository.getExpiredSubscriptions();
        } catch (error) {
            throw error;
        }
    }

    async getShopSubscriptions(shopId: number) {
        try {
            return await this.repository.getShopSubscriptions(shopId);
        } catch (error) {
            throw error;
        }
    }
} 