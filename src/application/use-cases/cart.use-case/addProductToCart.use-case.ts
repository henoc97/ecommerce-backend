import { Injectable, Inject } from '@nestjs/common';
import { CartService } from 'src/application/services/cart.service';
import { CartItemService } from 'src/application/services/cartitem.service';
import { ProductService } from 'src/application/services/product.service';
import { ProductVariantService } from 'src/application/services/productvariant.service';

@Injectable()
export class AddProductToCartUseCase {
    constructor(
        @Inject(CartService) private readonly Service: CartService,
        @Inject(ProductVariantService) private readonly productVariantService: ProductVariantService,
        @Inject(ProductService) private readonly productService: ProductService,
        @Inject(CartItemService) private readonly cartItemService: CartItemService,
    ) { }

    async execute(userId: number, productVariantId: number, quantity: number) {
        // 1. Trouver le shop du produit
        const productVariant = await this.productVariantService.findById(productVariantId);
        if (!productVariant) throw new Error('Variante de produit introuvable');
        const productId = productVariant.productId;

        const product = await this.productService.findById(productId);
        if (!product) throw new Error('Produit introuvable');
        const shopId = product.shopId;

        // 2. Vérifier si le user a déjà un cart pour ce shop
        let cart = await this.Service.findByUserIdAndShopId(userId, shopId);
        if (!cart) {
            cart = await this.Service.createCart(userId, shopId);
        }

        // 3. Vérifier si le produit est déjà dans le panier
        const existingItem = await this.cartItemService.findByCartIdAndProductId(cart.id, productId);
        if (existingItem) return 'conflict';

        // 4. Vérifier le stock (optionnel, à adapter selon ta logique)
        if (productVariant.stock < quantity) return 'stock';

        // 5. Ajouter le CartItem
        const cartItem = await this.cartItemService.addItem(cart.id, productId, quantity);
        // Mettre à jour les totaux du panier
        await this.Service.updateCartTotals(cart.id);
        return cartItem;
    }
} 