import { Injectable, Inject } from '@nestjs/common';
import { CartService } from '../../services/cart.service';
import { CartItemService } from '../../services/cartitem.service';
import { ProductVariantService } from '../../services/productvariant.service';
import { OrderService } from '../../services/order.service';
import { OrderItemService } from '../../services/orderitem.service';
import { OrderStatus } from '../../../domain/enums/OrderStatus.enum';
import { OrderEntity } from '../../../domain/entities/Order.entity';
import { OrderItemEntity } from '../../../domain/entities/OrderItem.entity';
import { PromotionService } from '../../services/promotion.service';
import { DiscountType } from 'src/domain/enums/DiscountType.enum';

@Injectable()
export class CreateOrderFromCartUseCase {
    constructor(
        @Inject(CartService) private readonly cartService: CartService,
        @Inject(CartItemService) private readonly cartItemService: CartItemService,
        @Inject(ProductVariantService) private readonly productVariantService: ProductVariantService,
        @Inject(OrderService) private readonly orderService: OrderService,
        @Inject(OrderItemService) private readonly orderItemService: OrderItemService,
        @Inject(PromotionService) private readonly promotionService: PromotionService,
    ) { }

    async execute(userId: number, shopId: number) {
        console.log('[CreateOrderFromCart] Start', { userId, shopId });
        const cart = await this.getCartWithItems(userId, shopId);
        if (!cart) return { error: 'Panier vide' };
        const { items, cartEntity } = cart;
        const check = await this.checkAvailability(items);
        if (check.errors.length > 0) return { error: 'Erreur de disponibilité', details: check.errors };
        const order = await this.createOrder(userId, shopId, cartEntity);
        await this.createOrderItemsAndUpdateStock(order, items, check.variants);
        await this.clearCart(cartEntity.id);
        await this.updateOrderTotal(order.id);
        console.log('[CreateOrderFromCart] FIN', { orderId: order.id });
        return { orderId: order.id };
    }

    private async getCartWithItems(userId: number, shopId: number) {
        var cart = await this.cartService.findByUserIdAndShopId(userId, shopId);
        if (!cart) {
            console.warn('[CreateOrderFromCart] Panier vide', { userId, shopId });
            return null;
        }
        const items = await this.cartService.getCartItems(cart.id);
        if (!items || items.length === 0) {
            console.warn('[CreateOrderFromCart] Panier sans items', { cartId: cart.id });
            return null;
        }
        return { items, cartEntity: cart };
    }

    private async checkAvailability(items: any[]) {
        const errors: any[] = [];
        const variants: any[] = [];
        for (const item of items) {
            const variant = await this.productVariantService.findById(item.productVariantId);
            if (!variant) {
                errors.push({ prod: item.productVariantId, error: 'Produit supprimé' });
                console.warn('[CreateOrderFromCart] Produit supprimé', { productVariantId: item.productVariantId });
                continue;
            }
            if (variant.stock < item.quantity) {
                errors.push({ prod: item.productVariantId, error: 'Stock insuffisant', available: variant.stock });
                console.warn('[CreateOrderFromCart] Stock insuffisant', { productVariantId: item.productVariantId, stock: variant.stock, wanted: item.quantity });
            }
            variants.push(variant);
        }
        if (errors.length > 0) {
            console.warn('[CreateOrderFromCart] Erreur de disponibilité', errors);
        }
        return { errors, variants };
    }

    private async createOrder(userId: number, shopId: number, cart: any) {
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes après création
        const orderData: Partial<OrderEntity> = {
            userId,
            shopId,
            status: OrderStatus.PENDING,
            totalAmount: cart.totalPrice,
            expiresAt,
        };
        const order = await this.orderService.createOrder(orderData as OrderEntity);
        console.log('[CreateOrderFromCart] Commande créée', { orderId: order.id });
        return order;
    }

    private async createOrderItemsAndUpdateStock(order: any, items: any[], variants: any[]) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const variant = variants[i];
            // Appliquer la meilleure promotion active
            let finalPrice = variant.price;
            const promos = await this.promotionService.getVariantPromotions(variant.id);
            const now = new Date();
            const activePromos = promos.filter(p => new Date(p.startDate) <= now && new Date(p.endDate) >= now);
            if (activePromos.length > 0) {
                // Prend la promo la plus avantageuse
                const bestPromo = activePromos.reduce((best, p) => {
                    if (!best) return p;
                    const bestValue = best.discountType === DiscountType.PERCENTAGE ? best.discountValue * variant.price / 100 : best.discountValue;
                    const pValue = p.discountType === DiscountType.PERCENTAGE ? p.discountValue * variant.price / 100 : p.discountValue;
                    return pValue > bestValue ? p : best;
                }, null);
                if (bestPromo) {
                    if (bestPromo.discountType === DiscountType.PERCENTAGE) {
                        finalPrice = variant.price * (1 - bestPromo.discountValue / 100);
                    } else {
                        finalPrice = Math.max(0, variant.price - bestPromo.discountValue);
                    }
                    console.log('[CreateOrderFromCart] Promo appliquée', { productVariantId: variant.id, promoId: bestPromo.id, finalPrice });
                }
            }
            const orderItem: Partial<OrderItemEntity> = {
                orderId: order.id,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                price: finalPrice,
            };
            await this.orderItemService.addOrderItem(order.id, orderItem as OrderItemEntity);
            await this.productVariantService.setStock(item.productVariantId, variant.stock - item.quantity);
            console.log('[CreateOrderFromCart] OrderItem créé', { orderId: order.id, productVariantId: item.productVariantId, price: finalPrice, quantity: item.quantity });
        }
    }

    private async clearCart(cartId: number) {
        const cartItems = await this.cartItemService.listItemsByCart(cartId);
        for (const cartItem of cartItems) {
            await this.cartItemService.deleteItem(cartItem.id);
        }
        await this.cartService.deleteCart(cartId);
        console.log('[CreateOrderFromCart] Panier supprimé', { cartId });
    }

    private async updateOrderTotal(orderId: number) {
        const orderItems = await this.orderItemService.listItemsByOrder(orderId);
        const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await this.orderService.updateOrder(orderId, { totalAmount });
        console.log('[CreateOrderFromCart] totalAmount mis à jour', { orderId, totalAmount });
    }
} 