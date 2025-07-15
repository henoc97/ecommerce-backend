import { Module } from '@nestjs/common';
import { SellerController } from 'src/presentation/controllers/Seller.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [SellerController],
})
export class SellerModule { } 