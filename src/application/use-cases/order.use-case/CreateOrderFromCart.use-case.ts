import { Injectable, Inject } from '@nestjs/common';
import { CartService } from '../../services/cart.service';
import { CartItemService } from '../../services/cartitem.service';
import { ProductVariantService } from '../../services/productvariant.service';
import { OrderService } from '../../services/order.service';
import { OrderItemService } from '../../services/orderitem.service';
import { OrderStatus } from '../../../domain/enums/OrderStatus.enum';
import { OrderEntity } from '../../../domain/entities/Order.entity';
import { OrderItemEntity } from '../../../domain/entities/OrderItem.entity';

@Injectable()
export class CreateOrderFromCartUseCase {
    constructor(
        @Inject(CartService) private readonly cartService: CartService,
        @Inject(CartItemService) private readonly cartItemService: CartItemService,
        @Inject(ProductVariantService) private readonly productVariantService: ProductVariantService,
        @Inject(OrderService) private readonly orderService: OrderService,
        @Inject(OrderItemService) private readonly orderItemService: OrderItemService,
    ) { }

    async execute(userId: number, shopId: number, paymentId?: number) {
        // 1. Récupérer le panier et ses items

        var cart = await this.cartService.findByUserIdAndShopId(userId, shopId);

        const cartItem = await this.cartItemService.findById(cart.id);
        await this.cartService.updateCartTotals(cartItem.cartId);

        cart = await this.cartService.findByUserIdAndShopId(userId, shopId);

        if (!cart) return { error: 'Panier vide' };
        const items = await this.cartService.getCartItems(cart.id);
        if (!items || items.length === 0) return { error: 'Panier vide' };

        // 2. Vérifier disponibilité de chaque produit
        const errors: any[] = [];
        const variants: any[] = [];
        for (const item of items) {
            const variant = await this.productVariantService.findById(item.productVariantId);
            if (!variant) {
                errors.push({ prod: item.productVariantId, error: 'Produit supprimé' });
                continue;
            }
            if (variant.stock < item.quantity) {
                errors.push({ prod: item.productVariantId, error: 'Stock insuffisant', available: variant.stock });
            }
            variants.push(variant);
        }
        if (errors.length > 0) return { error: 'Erreur de disponibilité', details: errors };

        // 3. Créer la commande
        const orderData: Partial<OrderEntity> = {
            userId,
            shopId,
            paymentId,
            status: OrderStatus.PENDING,
            totalAmount: cart.totalPrice,
        };
        const order = await this.orderService.createOrder(orderData as OrderEntity);

        // 4. Créer les OrderItems et mettre à jour le stock
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const variant = variants[i];
            const orderItem: Partial<OrderItemEntity> = {
                orderId: order.id,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                price: variant.price,
            };
            await this.orderItemService.addOrderItem(order.id, orderItem as OrderItemEntity);
            await this.productVariantService.setStock(item.productVariantId, variant.stock - item.quantity);
        }

        // 5. Supprimer les items du panier puis le panier
        const cartItems = await this.cartItemService.listItemsByCart(cart.id);
        for (const cartItem of cartItems) {
            await this.cartItemService.deleteItem(cartItem.id);
        }
        await this.cartService.deleteCart(cart.id);

        return { orderId: order.id };
    }
} 