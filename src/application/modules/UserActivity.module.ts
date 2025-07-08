import { Module } from '@nestjs/common';
import { UserActivityController } from 'src/presentation/controllers/UserActivity.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [UserActivityController],
})
export class UserActivityModule { } 