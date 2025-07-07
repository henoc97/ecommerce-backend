import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionPrismaRepository } from '../../infrastructure/impl.repositories/SubscriptionPrisma.repository';
import { SubscriptionEntity } from '../../domain/entities/Subscription.entity';

@Injectable()
export class SubscriptionService {
    constructor(
        @Inject(SubscriptionPrismaRepository) private readonly repository: SubscriptionPrismaRepository,
    ) { }

    async createSubscription(data: SubscriptionEntity) {
        try {
            return await this.repository.createSubscription(data);
        } catch (error) {
            throw error;
        }
    }
    async updateSubscription(id: number, data: Partial<SubscriptionEntity>) {
        try {
            return await this.repository.updateSubscription(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteSubscription(id: number) {
        try {
            return await this.repository.deleteSubscription(id);
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
    async listSubscriptions() {
        try {
            return await this.repository.listSubscriptions();
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
