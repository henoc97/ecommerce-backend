import { Module } from '@nestjs/common';
import { RefundController } from 'src/presentation/controllers/Refund.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [RefundController],
})
export class RefundModule { } 