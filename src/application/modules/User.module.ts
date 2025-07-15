import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { UserController } from 'src/presentation/controllers/User.controller';

@Module({
    imports: [CoreModule],
    controllers: [UserController],
})
export class UserModule { } 