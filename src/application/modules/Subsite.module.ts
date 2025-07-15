import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { SubsiteController } from 'src/presentation/controllers/Subsite.controller';

@Module({
    imports: [CoreModule],
    controllers: [SubsiteController],
})
export class SubsiteModule { } 