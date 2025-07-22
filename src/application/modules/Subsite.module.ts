import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { SubsiteController } from '../../presentation/controllers/Subsite.controller';

@Module({
    imports: [CoreModule],
    controllers: [SubsiteController],
})
export class SubsiteModule { } 