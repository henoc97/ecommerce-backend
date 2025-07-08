import { Module } from '@nestjs/common';
import { AuthModule } from './Auth.module';
import { UserProfileModule } from './UserProfile.module';
import { ProductModule } from './Product.module';
import { ShopModule } from './Shop.module';
import { UserActivityModule } from './UserActivity.module';

@Module({
  imports: [AuthModule, UserProfileModule, ShopModule, ProductModule, UserActivityModule],
})
export class AppModule { }
