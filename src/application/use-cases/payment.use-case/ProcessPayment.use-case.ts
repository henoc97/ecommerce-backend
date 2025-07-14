import { Injectable, Inject } from '@nestjs/common';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { OrderStatus } from '../../../domain/enums/OrderStatus.enum';
import { PaymentStatus } from '../../../domain/enums/PaymentStatus.enum';
import { PaymentEntity } from '../../../domain/entities/Payment.entity';
import { PaymentGatewayFactory } from '../../factories/paymentGateway.factory';
import { PaymentGatewayRequest, PaymentGatewayResponse } from 'src/domain/entities/PaymentGateway.entity';
export interface PaymentDto {
    orderId: number;
    method: string;
    amount: number;
    currency: string;
    cardData?: any;
    paypalData?: any;
}

export interface PaymentResult {
    success: boolean;
    error?: string;
    code?: number;
    details?: any;
    payment?: any;
    providerId?: string;
}

@Injectable()
export class ProcessPaymentUseCase {
    constructor(
        @Inject(OrderService) private readonly orderService: OrderService,
        @Inject(PaymentService) private readonly paymentService: PaymentService,
        @Inject(PaymentGatewayFactory) private readonly paymentGatewayFactory: PaymentGatewayFactory,
    ) { }

    async execute(userId: number, dto: PaymentDto): Promise<PaymentResult> {
        // 1. Vérifier la commande
        const order = await this.orderService.findById(dto.orderId);
        if (!order) {
            return {
                success: false,
                error: 'Commande introuvable',
                code: 400
            };
        }

        if (order.userId !== userId) {
            return {
                success: false,
                error: 'Commande invalide',
                code: 400
            };
        }

        if (order.status !== OrderStatus.PENDING) {
            return {
                success: false,
                error: 'Commande déjà traitée',
                code: 400
            };
        }

        // 2. Préparer la requête pour la gateway
        const gatewayRequest: PaymentGatewayRequest = {
            amount: dto.amount,
            currency: dto.currency,
            method: dto.method,
            cardData: dto.cardData,
            paypalData: dto.paypalData,
            metadata: {
                orderId: dto.orderId,
                userId: userId,
                description: `Paiement pour la commande #${dto.orderId}`,
            }
        };

        // 3. Appeler la gateway de paiement appropriée
        let paymentResult: PaymentGatewayResponse;
        try {
            const gatewayService = this.paymentGatewayFactory.getService(dto.method);
            paymentResult = await gatewayService.processPayment(gatewayRequest);
        } catch (error) {
            // Erreur réseau/gateway ou méthode non supportée
            await this.recordFailedPayment(order.id, dto, {
                error: error.message,
                errorType: 'gateway_error'
            });
            return {
                success: false,
                error: 'Erreur de paiement externe',
                code: 502,
                details: { message: error.message }
            };
        }

        // 4. Traiter le résultat du paiement
        if (!paymentResult.success) {
            await this.recordFailedPayment(order.id, dto, paymentResult.details);
            return {
                success: false,
                error: 'Paiement refusé',
                code: 402,
                details: paymentResult.details
            };
        }

        // 5. Paiement accepté : enregistrer et mettre à jour la commande
        await this.recordSuccessfulPayment(order.id, dto, paymentResult);
        await this.orderService.updateOrder(order.id, { status: OrderStatus.PROCESSING });

        return {
            success: true,
            payment: paymentResult,
            providerId: paymentResult.providerId
        };
    }

    private async recordFailedPayment(orderId: number, dto: PaymentDto, details: any): Promise<void> {
        const paymentData: Partial<PaymentEntity> = {
            orderId,
            status: PaymentStatus.FAILED,
            method: dto.method,
            amount: dto.amount,
            currency: dto.currency as any,
            metadata: {
                ...details,
                failedAt: new Date().toISOString(),
                originalRequest: {
                    amount: dto.amount,
                    currency: dto.currency,
                    method: dto.method,
                }
            }
        };
        await this.paymentService.createPayment(paymentData as PaymentEntity);
    }

    private async recordSuccessfulPayment(orderId: number, dto: PaymentDto, result: any): Promise<void> {
        const paymentData: Partial<PaymentEntity> = {
            orderId,
            status: PaymentStatus.SUCCESS,
            method: dto.method,
            amount: dto.amount,
            currency: dto.currency as any,
            providerId: result.providerId,
            metadata: {
                ...result.details,
                transactionId: result.transactionId,
                processedAt: new Date().toISOString(),
                originalRequest: {
                    amount: dto.amount,
                    currency: dto.currency,
                    method: dto.method,
                }
            }
        };
        await this.paymentService.createPayment(paymentData as PaymentEntity);
    }
} 