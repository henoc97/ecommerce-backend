import { Module } from '@nestjs/common';
import { AuthModule } from './Auth.module';
import { UserProfileModule } from './UserProfile.module';
import { ShopModule } from './Shop.module';

@Module({
  imports: [AuthModule, UserProfileModule, ShopModule],
})
export class AppModule { }
