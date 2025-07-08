import { Module } from '@nestjs/common';
import { AuthModule } from './Auth.module';
import { UserProfileModule } from './UserProfile.module';
import { ProductModule } from './Product.module';
import { UserService } from '../services/user.service';
import { PassportConfig } from '../config/passport.config';
import { ShopModule } from './Shop.module';

@Module({
  imports: [AuthModule, UserProfileModule, ShopModule, ProductModule],
})
export class AppModule { }
