import { Module } from '@nestjs/common';

import { UserService } from '../services/user.service';
import { AddressService } from '../services/address.service';
import { ProductService } from '../services/product.service';
import { ShopService } from '../services/shop.service';
import { CategoryService } from '../services/category.service';
import { UserActivityService } from '../services/useractivity.service';
import { UserPrismaRepository } from '../../infrastructure/impl.repositories/UserPrisma.repository';
import { AddressPrismaRepository } from '../../infrastructure/impl.repositories/AddressPrisma.repository';
import { ProductPrismaRepository } from '../../infrastructure/impl.repositories/ProductPrisma.repository';
import { ShopPrismaRepository } from '../../infrastructure/impl.repositories/ShopPrisma.repository';
import { CategoryPrismaRepository } from '../../infrastructure/impl.repositories/CategoryPrisma.repository';
import { UserActivityPrismaRepository } from '../../infrastructure/impl.repositories/UserActivityPrisma.repository';
import { AuthService } from '../services/auth.service';
import { PassportConfig } from '../config/passport.config';
import { AddProductToCartUseCase } from '../use-cases/cart.use-case/addProductToCart.use-case';
import { UpdateCartItemQuantityUseCase } from '../use-cases/cart.use-case/updateCartItemQuantity.use-case';
import { CartService } from '../services/cart.service';
import { CartPrismaRepository } from 'src/infrastructure/impl.repositories/CartPrisma.repository';
import { ProductVariantService } from '../services/productvariant.service';
import { ProductVariantPrismaRepository } from 'src/infrastructure/impl.repositories/ProductVariantPrisma.repository';
import { CartItemService } from '../services/cartitem.service';
import { CartItemPrismaRepository } from 'src/infrastructure/impl.repositories/CartItemPrisma.repository';
import { ReviewService } from '../services/review.service';
import { ReviewPrismaRepository } from 'src/infrastructure/impl.repositories/ReviewPrisma.repository';
import { ListActiveShopsWithStatsUseCase } from '../use-cases/shop.use-case/ListActiveShopsWithStats.use-case';

@Module({
    providers: [
        AuthService,
        PassportConfig,
        UserService,
        AddressService,
        ProductService,
        ShopService,
        CategoryService,
        UserActivityService,
        CartService,
        CartItemService,
        ProductVariantService,
        ReviewService,
        // ... autres services
        AddProductToCartUseCase,
        UpdateCartItemQuantityUseCase,
        ListActiveShopsWithStatsUseCase,
        // ... autres use-cases
        UserPrismaRepository,
        AddressPrismaRepository,
        ProductPrismaRepository,
        ShopPrismaRepository,
        CategoryPrismaRepository,
        UserActivityPrismaRepository,
        CartPrismaRepository,
        CartItemPrismaRepository,
        ProductVariantPrismaRepository,
        ReviewPrismaRepository
        // ... autres repositories
    ],
    exports: [
        AuthService,
        PassportConfig,
        UserService,
        AddressService,
        ProductService,
        ShopService,
        CategoryService,
        UserActivityService,
        CartService,
        CartItemService,
        ProductVariantService,
        ReviewService,
        // ... autres services
        AddProductToCartUseCase,
        UpdateCartItemQuantityUseCase,
        ListActiveShopsWithStatsUseCase,
        // ... autres use-cases
        UserPrismaRepository,
        AddressPrismaRepository,
        ProductPrismaRepository,
        ShopPrismaRepository,
        CategoryPrismaRepository,
        UserActivityPrismaRepository,
        CartPrismaRepository,
        ProductVariantPrismaRepository,
        CartItemPrismaRepository,
        ReviewPrismaRepository
        // ... autres repositories
    ],
})
export class CoreModule { }