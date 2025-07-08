import { CartItemEntity } from "../entities/CartItem.entity";

export interface ICartItemRepository {
    addItem(cartId: number, productVariantId: number, quantity: number): Promise<CartItemEntity>;
    updateItemQuantity(id: number, quantity: number): Promise<CartItemEntity>;
    deleteItem(id: number): Promise<void>;
    findById(id: number): Promise<CartItemEntity>;
    findByCartIdAndProductId(cartId: number, productId: number): Promise<CartItemEntity | null>;
    listItemsByCart(cartId: number): Promise<CartItemEntity[]>;
} 