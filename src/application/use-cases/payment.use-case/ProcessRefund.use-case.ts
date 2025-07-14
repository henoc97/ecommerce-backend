import { Injectable, Inject } from '@nestjs/common';
import { PaymentService } from '../../services/payment.service';
import { RefundService } from '../../services/refund.service';
import { OrderService } from '../../services/order.service';
import { PaymentStatus } from '../../../domain/enums/PaymentStatus.enum';
import { RefundStatus } from '../../../domain/enums/RefundStatus.enum';
import { OrderStatus } from '../../../domain/enums/OrderStatus.enum';
import { PaymentGatewayFactory } from 'src/application/factories/paymentGateway.factory';

export interface RefundDto {
    paymentId: number;
    amount?: number; // Si non spécifié, rembourse le montant total
    reason?: string;
}

export interface RefundResult {
    success: boolean;
    error?: string;
    code?: number;
    details?: any;
    refund?: any;
    refundId?: number;
}

@Injectable()
export class ProcessRefundUseCase {
    constructor(
        @Inject(PaymentService) private readonly paymentService: PaymentService,
        @Inject(RefundService) private readonly refundService: RefundService,
        @Inject(OrderService) private readonly orderService: OrderService,
        @Inject(PaymentGatewayFactory) private readonly paymentGatewayFactory: PaymentGatewayFactory,
    ) { }

    async execute(userId: number, dto: RefundDto): Promise<RefundResult> {
        // 1. Vérifier que le paiement existe et appartient à l'utilisateur
        const payment = await this.paymentService.findById(dto.paymentId);
        if (!payment) {
            return {
                success: false,
                error: 'Paiement introuvable',
                code: 404
            };
        }

        // Vérifier que l'utilisateur a accès à ce paiement via la commande
        const order = await this.orderService.findById(payment.orderId);
        if (!order || order.userId !== userId) {
            return {
                success: false,
                error: 'Accès non autorisé à ce paiement',
                code: 403
            };
        }

        // 2. Vérifier que le paiement peut être remboursé
        if (payment.status !== PaymentStatus.SUCCESS) {
            return {
                success: false,
                error: 'Le paiement doit être en statut SUCCESS pour être remboursé',
                code: 400
            };
        }

        // 3. Déterminer le montant à rembourser
        const refundAmount = dto.amount || payment.amount;
        if (refundAmount > payment.amount) {
            return {
                success: false,
                error: 'Le montant de remboursement ne peut pas dépasser le montant du paiement',
                code: 400
            };
        }

        // 4. Appeler la gateway de remboursement
        let refundResult;
        try {
            const gatewayService = this.paymentGatewayFactory.getService(payment.method);
            refundResult = await gatewayService.refundPayment(payment.providerId, refundAmount);
        } catch (error) {
            return {
                success: false,
                error: 'Erreur lors du remboursement via la gateway',
                code: 502,
                details: { message: error.message }
            };
        }

        // 5. Traiter le résultat du remboursement
        if (!refundResult.success) {
            return {
                success: false,
                error: 'Remboursement refusé par la gateway',
                code: 402,
                details: refundResult.details
            };
        }

        // 6. Enregistrer le remboursement en base
        const refundData = {
            orderId: payment.orderId,
            reason: dto.reason || 'Remboursement client',
            amount: refundAmount,
            status: RefundStatus.APPROVED,
        };

        const refund = await this.refundService.createRefund(refundData as any);

        // 7. Mettre à jour le statut de la commande si remboursement total
        if (refundAmount >= payment.amount) {
            await this.orderService.updateOrder(payment.orderId, { status: OrderStatus.REFUNDED });
        }

        return {
            success: true,
            refund: refundResult,
            refundId: refund.id
        };
    }
} 