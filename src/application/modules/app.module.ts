import { Module } from '@nestjs/common';
import { AuthModule } from './Auth.module';
import { UserProfileModule } from './UserProfile.module';

@Module({
  imports: [AuthModule, UserProfileModule],
})
export class AppModule { }
