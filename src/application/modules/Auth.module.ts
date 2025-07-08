import { Module } from '@nestjs/common';
import { AuthController } from '../../presentation/controllers/Auth.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [AuthController],
})
export class AuthModule { } 