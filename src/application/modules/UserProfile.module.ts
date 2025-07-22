
import { UserProfileController } from '../../presentation/controllers/UserProfile.controller';
import { CoreModule } from './Core.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [CoreModule],
    controllers: [UserProfileController],
})
export class UserProfileModule { } 