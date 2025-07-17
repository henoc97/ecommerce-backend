import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from './order.service';

@Injectable()
export class OrderCronService {
    private readonly logger = new Logger(OrderCronService.name);
    constructor(private readonly orderService: OrderService) { }

    // Exécute toutes les minutes
    @Cron(CronExpression.EVERY_MINUTE)
    async handleCancelExpiredOrders() {
        const count = await this.orderService.cancelExpiredUnpaidOrders();
        if (count > 0) {
            this.logger.warn(`Commandes expirées annulées : ${count}`);
        }
    }
} 