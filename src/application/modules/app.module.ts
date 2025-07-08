import { Module } from '@nestjs/common';
import { AuthModule } from './Auth.module';
import { UserProfileModule } from './UserProfile.module';
import { ProductModule } from './Product.module';
import { ShopModule } from './Shop.module';
import { UserActivityModule } from './UserActivity.module';
import { CartModule } from './cart.module';
import { OrdertModule } from './Order.module';

@Module({
  imports: [AuthModule, UserProfileModule, ShopModule, CartModule, ProductModule, UserActivityModule, OrdertModule],
})
export class AppModule { }
