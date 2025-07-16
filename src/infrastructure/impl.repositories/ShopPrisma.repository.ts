import prisma from '../../../prisma/client/prisma.service';
import { ShopEntity } from '../../domain/entities/Shop.entity';
import { ProductEntity } from '../../domain/entities/Product.entity';
import { SubsiteEntity } from '../../domain/entities/Subsite.entity';
import { ShopSubscriptionEntity } from '../../domain/entities/ShopSubscription.entity';
import { OrderEntity } from '../../domain/entities/Order.entity';
import { PaymentEntity } from '../../domain/entities/Payment.entity';
import { RefundEntity } from '../../domain/entities/Refund.entity';
import { ReviewEntity } from '../../domain/entities/Review.entity';
import { IShopRepository } from '../../domain/repositories/Shop.repository';
import { Prisma } from '@prisma/client';

export class ShopPrismaRepository implements IShopRepository {
    async createShop(data: ShopEntity): Promise<ShopEntity> {
        try {
            return await prisma.shop.create({ data: data as Prisma.ShopCreateInput }) as ShopEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateShop(id: number, data: Partial<ShopEntity>): Promise<ShopEntity> {
        try {
            return await prisma.shop.update({ where: { id } as Prisma.ShopWhereUniqueInput, data: data as Prisma.ShopUpdateInput }) as ShopEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteShop(id: number): Promise<void> {
        try {
            await prisma.shop.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<ShopEntity> {
        try {
            return await prisma.shop.findUnique({ where: { id } as Prisma.ShopWhereUniqueInput }) as ShopEntity;
        } catch (error) {
            throw error;
        }
    }
    async listAllShops(filter?: Partial<ShopEntity>): Promise<ShopEntity[]> {
        try {
            return await prisma.shop.findMany({ where: filter as Prisma.ShopWhereInput }) as ShopEntity[];
        } catch (error) {
            throw error;
        }
    }
    async listActiveShopsWithProducts(): Promise<ShopEntity[]> {
        try {
            const now = new Date();
            return await prisma.shop.findMany({
                where: {
                    shopSubscriptions: {
                        some: {
                            OR: [
                                { endDate: null },
                                { endDate: { gt: now } }
                            ]
                        }
                    }
                },
                include: {
                    products: true,
                }
            }) as ShopEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getShopSubsite(shopId: number): Promise<SubsiteEntity> {
        try {
            return await prisma.subsite.findFirst({ where: { shopId } as Prisma.SubsiteWhereInput }) as SubsiteEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateShopSubsite(shopId: number, config: Partial<SubsiteEntity>): Promise<SubsiteEntity> {
        try {
            const subsite = await prisma.subsite.findFirst({ where: { shopId } as Prisma.SubsiteWhereInput });
            if (!subsite) throw new Error('Subsite not found');
            return await prisma.subsite.update({ where: { id: subsite.id } as Prisma.SubsiteWhereUniqueInput, data: config as Prisma.SubsiteUpdateInput }) as SubsiteEntity;
        } catch (error) {
            throw error;
        }
    }
    async subscribeToPlan(shopId: number, subscriptionId: number): Promise<ShopSubscriptionEntity> {
        try {
            return await prisma.shopSubscription.create({ data: { shopId, subscriptionId } }) as ShopSubscriptionEntity;
        } catch (error) {
            throw error;
        }
    }
    async getShopOrders(shopId: number): Promise<OrderEntity[]> {
        try {
            return await prisma.order.findMany({ where: { shopId } }) as OrderEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getShopPayments(shopId: number): Promise<PaymentEntity[]> {
        try {
            return await prisma.payment.findMany({ where: { order: { shopId } } }) as PaymentEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getShopRefunds(shopId: number): Promise<RefundEntity[]> {
        try {
            return await prisma.refund.findMany({ where: { order: { shopId } } }) as RefundEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getShopReviews(shopId: number): Promise<ReviewEntity[]> {
        try {
            return await prisma.review.findMany({ where: { productVariant: { product: { shopId } } } }) as ReviewEntity[];
        } catch (error) {
            throw error;
        }
    }
} 