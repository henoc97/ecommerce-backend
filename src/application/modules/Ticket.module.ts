import { Module } from '@nestjs/common';
import { TicketController } from '../../presentation/controllers/Ticket.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [TicketController],
})
export class TicketModule { } 