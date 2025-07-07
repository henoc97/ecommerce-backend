import { Currency } from "../enums/Currency.enum";
import { PaymentStatus } from "../enums/PaymentStatus.enum";
import { OrderEntity } from "./Order.entity";

export class PaymentEntity {
    id: number;
    status: PaymentStatus;
    method: string; // e.g., Stripe, PayPal, Bank Transfer
    amount: number = 0;
    providerId?: string;
    metadata?: any; // JSON field to store payment metadata
    currency: Currency;
    createdAt: Date;
    orderId?: number;
    order?: OrderEntity;
} 