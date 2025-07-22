import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { AdminController } from '../../presentation/controllers/Admin.controller';

@Module({
    imports: [CoreModule],
    controllers: [AdminController],
})
export class AdminModule { } 