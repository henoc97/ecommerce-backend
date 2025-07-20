import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client/prisma.service';
import { OrderEntity } from '../../domain/entities/Order.entity';
import { OrderItemEntity } from '../../domain/entities/OrderItem.entity';
import { PaymentEntity } from '../../domain/entities/Payment.entity';
import { RefundEntity } from '../../domain/entities/Refund.entity';
import { OrderStatus } from '../../domain/enums/OrderStatus.enum';
import { IOrderRepository } from '../../domain/repositories/Order.repository';
import { PaymentStatus } from '../../domain/enums/PaymentStatus.enum';

export class OrderPrismaRepository implements IOrderRepository {
    async createOrder(data: OrderEntity): Promise<OrderEntity> {
        try {
            return await prisma.order.create({ data: data as Prisma.OrderCreateInput }) as OrderEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateOrder(id: number, data: Partial<OrderEntity>): Promise<OrderEntity> {
        try {
            return await prisma.order.update({ where: { id }, data: data as Prisma.OrderUpdateInput }) as OrderEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteOrder(id: number): Promise<void> {
        try {
            await prisma.order.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<OrderEntity> {
        try {
            return await prisma.order.findUnique({
                where: { id }, include: {
                    items: true,
                    payment: true,
                    shop: true,
                    refund: true
                }
            }) as OrderEntity;
        } catch (error) {
            throw error;
        }
    }
    async listOrders(filter?: Partial<OrderEntity>): Promise<OrderEntity[]> {
        try {
            return await prisma.order.findMany({
                where: filter as Prisma.OrderWhereInput, include: {
                    items: true,
                    payment: true,
                    shop: true,
                    refund: true
                }
            }) as OrderEntity[];
        } catch (error) {
            throw error;
        }
    }
    async listExpiredUnpaidOrders(now: Date): Promise<OrderEntity[]> {
        try {
            return await prisma.order.findMany({
                where: {
                    status: 'PENDING',
                    expiresAt: { lt: now },
                    paymentId: null,
                },
            }) as OrderEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getOrderItems(orderId: number): Promise<OrderItemEntity[]> {
        try {
            return await prisma.orderItem.findMany({ where: { orderId } }) as OrderItemEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getOrderPayment(orderId: number): Promise<PaymentEntity> {
        try {
            return await prisma.payment.findFirst({ where: { AND: { orderId, status: PaymentStatus.SUCCESS } } }) as PaymentEntity;
        } catch (error) {
            throw error;
        }
    }
    async getOrderRefund(orderId: number): Promise<RefundEntity> {
        try {
            return await prisma.refund.findFirst({ where: { orderId } }) as RefundEntity;
        } catch (error) {
            throw error;
        }
    }
    async getOrderStatus(orderId: number): Promise<OrderStatus> {
        try {
            const order = await prisma.order.findUnique({ where: { id: orderId } });
            return order?.status as OrderStatus;
        } catch (error) {
            throw error;
        }
    }
    async updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
        try {
            await prisma.order.update({ where: { id: orderId }, data: { status } });
        } catch (error) {
            throw error;
        }
    }

    async getTopSellers(from?: string, to?: string): Promise<any[]> {
        // Utilise Prisma pour compter les commandes par vendeur (vendorId via shop)
        // et retourne les vendeurs triés par nombre de commandes
        const where: any = {};
        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) where.createdAt.lte = new Date(to);
        }
        // Jointure avec Shop pour récupérer le vendorId
        const result = await prisma.order.groupBy({
            by: ['shopId'],
            where,
            _count: { id: true },
        });
        // Récupère les shops et vendors associés
        const shops = await prisma.shop.findMany({
            where: { id: { in: result.map(r => r.shopId) } },
            include: { vendor: true }
        });
        // Regroupe par vendeur
        const vendorStats: Record<number, { vendorId: number, totalOrders: number }> = {};
        for (const r of result) {
            const shop = shops.find(s => s.id === r.shopId);
            if (shop && shop.vendorId) {
                if (!vendorStats[shop.vendorId]) vendorStats[shop.vendorId] = { vendorId: shop.vendorId, totalOrders: 0 };
                vendorStats[shop.vendorId].totalOrders += r._count.id;
            }
        }
        return Object.values(vendorStats).sort((a, b) => b.totalOrders - a.totalOrders);
    }

    async getTopProducts(from?: string, to?: string): Promise<any[]> {
        // Utilise Prisma pour compter les OrderItem par productVariantId
        // puis regroupe par produit parent
        const where: any = {};
        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) where.createdAt.lte = new Date(to);
        }
        const orderItems = await prisma.orderItem.findMany({
            where,
            include: { productVatiant: { include: { product: true } } }
        });
        // Regroupe par produit
        const productStats: Record<number, { productId: number, totalSold: number }> = {};
        for (const item of orderItems) {
            const productId = item.productVatiant?.product?.id;
            if (productId) {
                if (!productStats[productId]) productStats[productId] = { productId, totalSold: 0 };
                productStats[productId].totalSold += item.quantity;
            }
        }
        return Object.values(productStats).sort((a, b) => b.totalSold - a.totalSold);
    }

    // GDPR - Recherche et anonymisation
    async findByUserId(userId: number): Promise<OrderEntity[]> {
        try {
            return await prisma.order.findMany({
                where: { userId },
                include: {
                    items: true,
                    payment: true,
                    shop: true,
                    refund: true
                }
            }) as OrderEntity[];
        } catch (error) {
            throw error;
        }
    }

    async anonymizeByUserId(userId: number): Promise<void> {
        try {
            // Anonymiser les commandes en gardant les données comptables
            await prisma.order.updateMany({
                where: { userId },
                data: {
                    userId: null, // Déconnecter de l'utilisateur
                    // Garder les autres données pour la comptabilité
                }
            });
        } catch (error) {
            throw error;
        }
    }
} 