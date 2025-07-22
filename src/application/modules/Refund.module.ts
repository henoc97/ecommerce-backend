import { Module } from '@nestjs/common';
import { RefundController } from '../../presentation/controllers/Refund.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [RefundController],
})
export class RefundModule { } 