import { Injectable, Inject } from '@nestjs/common';
import { OrderPrismaRepository } from '../../infrastructure/impl.repositories/OrderPrisma.repository';

@Injectable()
export class AnalyticsService {
    constructor(
        @Inject(OrderPrismaRepository) private readonly orderRepository: OrderPrismaRepository,
    ) { }

    async getTopSellers(from?: string, to?: string) {
        try {
            return await this.orderRepository.getTopSellers(from, to);
        } catch (error) {
            console.error('[AnalyticsService] getTopSellers ERROR', error);
            throw error;
        }
    }

    async getTopProducts(from?: string, to?: string) {
        try {
            return await this.orderRepository.getTopProducts(from, to);
        } catch (error) {
            console.error('[AnalyticsService] getTopProducts ERROR', error);
            throw error;
        }
    }
} 