import { Injectable, Inject } from '@nestjs/common';
import { CartItemService } from 'src/application/services/cartitem.service';
import { ProductVariantService } from 'src/application/services/productvariant.service';

@Injectable()
export class UpdateCartItemQuantityUseCase {
    constructor(
        @Inject(ProductVariantService) private readonly productVariantService: ProductVariantService,
        @Inject(CartItemService) private readonly cartItemService: CartItemService,
    ) { }

    async execute(id: number, quantity: number) {
        const cartItem = await this.cartItemService.findById(id);
        if (!cartItem) return 'not_found';

        const productVariant = await this.productVariantService.findById(cartItem.productVariantId);
        if (!productVariant) throw new Error('Variante de produit introuvable');

        // Vérifier le stock (optionnel, à adapter selon ta logique)
        if (productVariant.stock < quantity) return 'stock';

        // Mettre à jour les totaux du panier
        const result = await this.cartItemService.updateItemQuantity(id, quantity);
        return result;
    }
} 