import { Module } from '@nestjs/common';
import { AuthModule } from './Auth.module';
import { UserProfileModule } from './UserProfile.module';
import { ProductModule } from './Product.module';
import { ShopModule } from './Shop.module';
import { UserActivityModule } from './UserActivity.module';
import { CartModule } from './Cart.module';
import { OrderModule } from './Order.module';
import { PaymentModule } from './Payment.module';
import { ReviewModule } from './Review.module';
import { RefundModule } from './Refund.module';
import { NotificationModule } from './Notification.module';
import { TicketModule } from './Ticket.module';
import { VendorModule } from './Vendor.module';
import { SellerModule } from './Seller.module';
import { ProductVariantModule } from './ProductVariant.module';
import { PromotionModule } from './Promotion.module';
import { NewsletterSubscriptionModule } from './NewsletterSubscription.module';
import { CategoryModule } from './Category.module';
import { NewsletterCampaignModule } from './NewsletterCampaign.module';
import { AddressnModule } from './Address.module';
import { AuditLogModule } from './AuditLog.module';
import { ShopSubscriptionModule } from './ShopSubscription.module';
import { SubscriptionModule } from './Subscription.module';
import { UserModule } from './User.module';
import { SubsiteModule } from './Subsite.module';
import { AnalyticsModule } from './Analytics.module';

@Module({
  imports: [
    AuthModule,
    UserProfileModule,
    ShopModule,
    CartModule,
    ProductModule,
    UserActivityModule,
    OrderModule,
    PaymentModule,
    ReviewModule,
    RefundModule,
    NotificationModule,
    TicketModule,
    VendorModule,
    SellerModule,
    ProductVariantModule,
    PromotionModule,
    NewsletterSubscriptionModule,
    CategoryModule,
    NewsletterCampaignModule,
    AddressnModule,
    AuditLogModule,
    ShopSubscriptionModule,
    SubscriptionModule,
    UserModule,
    SubsiteModule,
    AnalyticsModule
  ],
})
export class AppModule { }
