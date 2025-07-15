import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { AuditLogController } from 'src/presentation/controllers/AuditLog.constroller';

@Module({
    imports: [CoreModule],
    controllers: [AuditLogController],
})
export class AuditLogModule { } 