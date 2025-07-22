import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { UserController } from '../../presentation/controllers/User.controller';

@Module({
    imports: [CoreModule],
    controllers: [UserController],
})
export class UserModule { } 