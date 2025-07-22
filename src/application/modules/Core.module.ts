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
import { CartPrismaRepository } from '../../infrastructure/impl.repositories/CartPrisma.repository';
import { ProductVariantService } from '../services/productvariant.service';
import { ProductVariantPrismaRepository } from '../../infrastructure/impl.repositories/ProductVariantPrisma.repository';
import { CartItemService } from '../services/cartitem.service';
import { CartItemPrismaRepository } from '../../infrastructure/impl.repositories/CartItemPrisma.repository';
import { ReviewService } from '../services/review.service';
import { ReviewPrismaRepository } from '../../infrastructure/impl.repositories/ReviewPrisma.repository';
import { ListActiveShopsWithStatsUseCase } from '../use-cases/shop.use-case/ListActiveShopsWithStats.use-case';
import { OrderService } from '../services/order.service';
import { OrderPrismaRepository } from '../../infrastructure/impl.repositories/OrderPrisma.repository';
import { CreateOrderFromCartUseCase } from '../use-cases/order.use-case/CreateOrderFromCart.use-case';
import { OrderItemService } from '../services/orderitem.service';
import { OrderItemPrismaRepository } from '../../infrastructure/impl.repositories/OrderItemPrisma.repository';
import { PaymentService } from '../services/payment.service';
import { ProcessPaymentUseCase } from '../use-cases/payment.use-case/ProcessPayment.use-case';
import { PaymentPrismaRepository } from '../../infrastructure/impl.repositories/PaymentPrisma.repository';
import { StripePaymentGatewayService } from '../../infrastructure/external-services/stripePaymentGateway.service';
import { PayPalPaymentGatewayService } from '../../infrastructure/external-services/payPalPaymentGateway.service';
import { PaymentGatewayFactory } from '../factories/paymentGateway.factory';
import { NewsletterSubscriptionService } from '../services/newslettersubscription.service';
import { NewsletterSubscriptionPrismaRepository } from '../../infrastructure/impl.repositories/NewsletterSubscriptionPrisma.repository';
import { ProductImageService } from '../services/productimage.service';
import { VendorService } from '../services/vendor.service';
import { VendorPrismaRepository } from '../../infrastructure/impl.repositories/VendorPrisma.repository';
import { ProductImagePrismaRepository } from '../../infrastructure/impl.repositories/ProductImagePrisma.repository';
import { ProcessRefundUseCase } from '../use-cases/payment.use-case/ProcessRefund.use-case';
import { RefundService } from '../services/refund.service';
import { RefundPrismaRepository } from '../../infrastructure/impl.repositories/RefundPrisma.repository';
import { NotificationService } from '../services/notification.service';
import { NotificationPrismaRepository } from '../../infrastructure/impl.repositories/NotificationPrisma.repository';
import { TicketService } from '../services/ticket.service';
import { TicketPrismaRepository } from '../../infrastructure/impl.repositories/TicketPrisma.repository';
import { PromotionService } from '../services/promotion.service';
import { PromotionPrismaRepository } from '../../infrastructure/impl.repositories/PromotionPrisma.repository';
import { CreatePromotionUseCase } from '../use-cases/promotion.use-case/CreatePromotion.use-case';
import { EmailService } from '../services/email.service';
import { AuditLogService } from '../services/auditlog.service';
import { AuditLogPrismaRepository } from '../../infrastructure/impl.repositories/AuditLogPrisma.repository';
import { ShopSubscriptionService } from '../services/shopsubscription.service';
import { ShopSubscriptionPrismaRepository } from '../../infrastructure/impl.repositories/ShopSubscriptionPrisma.repository';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionPrismaRepository } from '../../infrastructure/impl.repositories/SubscriptionPrisma.repository';
import { SubsiteService } from '../services/subsite.service';
import { SubsitePrismaRepository } from '../../infrastructure/impl.repositories/SubsitePrisma.repository';
import { AnalyticsService } from '../services/analytics.service';
import { AddImageToVariantUseCase } from '../use-cases/product-variant.use-case/AddImageToVariant.use-case';
import { DeleteImageFromVariantUseCase } from '../use-cases/product-variant.use-case/DeleteImageFromVariant.use-case';
import { CloudinaryService } from '../../infrastructure/external-services/cloudinary.service';
import { OrderCronService } from '../services/order-cron.service';
import { GDPRService } from '../services/gdpr.service';
import { DataProcessingRegistryService } from '../services/data-processing-registry.service';

const providersExports = [
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
    OrderService,
    OrderItemService,
    PaymentService,
    StripePaymentGatewayService,
    PayPalPaymentGatewayService,
    NewsletterSubscriptionService,
    ProductImageService,
    VendorService,
    RefundService,
    NotificationService,
    TicketService,
    PromotionService,
    EmailService,
    AuditLogService,
    ShopSubscriptionService,
    SubscriptionService,
    SubsiteService,
    AnalyticsService,
    CloudinaryService,
    OrderCronService,
    GDPRService,
    DataProcessingRegistryService,
    // ... autres factories
    PaymentGatewayFactory,
    // ... autres services
    AddProductToCartUseCase,
    UpdateCartItemQuantityUseCase,
    ListActiveShopsWithStatsUseCase,
    CreateOrderFromCartUseCase,
    ProcessPaymentUseCase,
    ProcessRefundUseCase,
    CreatePromotionUseCase,
    AddImageToVariantUseCase,
    DeleteImageFromVariantUseCase,
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
    ReviewPrismaRepository,
    OrderPrismaRepository,
    OrderItemPrismaRepository,
    PaymentPrismaRepository,
    NewsletterSubscriptionPrismaRepository,
    ProductImagePrismaRepository,
    VendorPrismaRepository,
    RefundPrismaRepository,
    NotificationPrismaRepository,
    TicketPrismaRepository,
    PromotionPrismaRepository,
    AuditLogPrismaRepository,
    ShopSubscriptionPrismaRepository,
    SubscriptionPrismaRepository,
    SubsitePrismaRepository,
    // ... autres repositories
]
@Module({
    providers: [
        ...providersExports
    ],
    exports: [
        ...providersExports
    ],
})
export class CoreModule { }