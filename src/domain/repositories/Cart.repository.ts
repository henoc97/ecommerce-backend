import { CartEntity } from "../entities/Cart.entity";
import { CartItemEntity } from "../entities/CartItem.entity";

export interface ICartRepository {
    createCart(userId: number, shopId: number): Promise<CartEntity>;
    findByUserIdAndShopId(userId: number, shopId: number): Promise<CartEntity>;
    getCartDetails(id: number): Promise<CartEntity>;
    listCartsByUser(userId: number): Promise<CartEntity[]>;
    getCartItems(cartId: number): Promise<CartItemEntity[]>;
    updateCartTotals(cartId: number): Promise<void>;
    deleteCart(cartId: number): Promise<void>;
    // GDPR - Recherche et suppression par utilisateur
    findByUserId(userId: number): Promise<CartEntity[]>;
    deleteByUserId(userId: number): Promise<void>;
} 