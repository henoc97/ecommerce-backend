import { Module } from '@nestjs/common';
import { VendorController } from 'src/presentation/controllers/Vendor.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [VendorController],
})
export class VendorModule { } 