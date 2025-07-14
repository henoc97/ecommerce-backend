import { Module } from '@nestjs/common';
import { NotificationController } from 'src/presentation/controllers/Notification.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [NotificationController],
})
export class NotificationModule { } 