import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { AddressController } from '../../presentation/controllers/Address.controller';

@Module({
    imports: [CoreModule],
    controllers: [AddressController],
})
export class AddressnModule { } 