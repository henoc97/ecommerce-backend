import { Injectable, Inject } from '@nestjs/common';
import { ShopPrismaRepository } from '../../infrastructure/impl.repositories/ShopPrisma.repository';
import { ShopEntity } from '../../domain/entities/Shop.entity';
import { SubsiteEntity } from '../../domain/entities/Subsite.entity';

@Injectable()
export class ShopService {
    constructor(
        @Inject(ShopPrismaRepository) private readonly repository: ShopPrismaRepository,
    ) { }

    async createShop(data: ShopEntity) {
        try {
            return await this.repository.createShop(data);
        } catch (error) {
            throw error;
        }
    }
    async updateShop(id: number, data: Partial<ShopEntity>) {
        try {
            return await this.repository.updateShop(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteShop(id: number) {
        try {
            return await this.repository.deleteShop(id);
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
    async listShops(filter?: Partial<ShopEntity>) {
        try {
            return await this.repository.listShops(filter);
        } catch (error) {
            throw error;
        }
    }
    async getShopProducts(shopId: number) {
        try {
            return await this.repository.getShopProducts(shopId);
        } catch (error) {
            throw error;
        }
    }
    async getShopSubsite(shopId: number) {
        try {
            return await this.repository.getShopSubsite(shopId);
        } catch (error) {
            throw error;
        }
    }
    async updateShopSubsite(shopId: number, config: Partial<SubsiteEntity>) {
        try {
            return await this.repository.updateShopSubsite(shopId, config);
        } catch (error) {
            throw error;
        }
    }
    async subscribeToPlan(shopId: number, subscriptionId: number) {
        try {
            return await this.repository.subscribeToPlan(shopId, subscriptionId);
        } catch (error) {
            throw error;
        }
    }
    async getShopOrders(shopId: number) {
        try {
            return await this.repository.getShopOrders(shopId);
        } catch (error) {
            throw error;
        }
    }
    async getShopPayments(shopId: number) {
        try {
            return await this.repository.getShopPayments(shopId);
        } catch (error) {
            throw error;
        }
    }
    async getShopRefunds(shopId: number) {
        try {
            return await this.repository.getShopRefunds(shopId);
        } catch (error) {
            throw error;
        }
    }
    async getShopReviews(shopId: number) {
        try {
            return await this.repository.getShopReviews(shopId);
        } catch (error) {
            throw error;
        }
    }
} 