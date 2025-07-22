import { Module } from '@nestjs/common';
import { ShopController } from '../../presentation/controllers/Shop.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [ShopController],
})
export class ShopModule { } 