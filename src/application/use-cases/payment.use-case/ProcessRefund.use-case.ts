import { Injectable, Inject } from '@nestjs/common';
import { PaymentService } from '../../services/payment.service';
import { RefundService } from '../../services/refund.service';
import { OrderService } from '../../services/order.service';
import { PaymentStatus } from '../../../domain/enums/PaymentStatus.enum';
import { RefundStatus } from '../../../domain/enums/RefundStatus.enum';
import { OrderStatus } from '../../../domain/enums/OrderStatus.enum';
import { PaymentGatewayFactory } from 'src/application/factories/paymentGateway.factory';
import { RefundDto } from 'src/presentation/dtos/Refund.dto';

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
        @Inject(RefundService) private readonly refundService: RefundService,
        @Inject(OrderService) private readonly orderService: OrderService,
        @Inject(PaymentGatewayFactory) private readonly paymentGatewayFactory: PaymentGatewayFactory,
    ) { }

    async execute(userId: number, dto: RefundDto): Promise<RefundResult> {
        // 1. Vérifier que le paiement existe et appartient à l'utilisateur
        const payment = await this.orderService.getOrderPayment(dto.orderId);
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

        // 4. Créer la demande de remboursement en base (statut PENDING)
        const refundData = {
            orderId: payment.orderId,
            reason: dto.reason || 'Remboursement client',
            amount: refundAmount,
            status: RefundStatus.PENDING,
        };
        const refund = await this.refundService.createRefund(refundData as any);

        return {
            success: true,
            refund: refund,
            refundId: refund.id
        };
    }

    // Appelée par l'admin/commerçant pour approuver le remboursement
    async approveRefund(refundId: number, userId: number): Promise<RefundResult> {
        // 1. Récupérer le remboursement et le paiement associé
        const refund = await this.refundService.findById(refundId);
        if (!refund) return { success: false, error: 'Remboursement introuvable', code: 404 };
        if (refund.status === RefundStatus.APPROVED) {
            return { success: false, error: 'Ce remboursement a déjà été approuvé.', code: 400 };
        }
        const payment = await this.orderService.getOrderPayment(refund.orderId);
        if (!payment) return { success: false, error: 'Paiement introuvable', code: 404 };
        // 2. Appeler la gateway
        let refundResult: RefundResult;
        try {
            const gatewayService = this.paymentGatewayFactory.getService(payment.method);
            refundResult = await gatewayService.refundPayment(payment.providerId, refund.amount);
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
        // 3. Mettre à jour le statut à APPROVED
        await this.refundService.updateRefund(refundId, { status: RefundStatus.APPROVED });
        // 4. Mettre à jour la commande si remboursement total
        if (refund.amount >= payment.amount) {
            await this.orderService.updateOrder(payment.orderId, { status: OrderStatus.REFUNDED });
        }
        return {
            success: true,
            refund: refundResult,
            refundId: refundId
        };
    }

    // Appelée par l'admin/commerçant pour refuser le remboursement
    async rejectRefund(refundId: number, userId: number): Promise<RefundResult> {
        const refund = await this.refundService.findById(refundId);
        if (!refund) return { success: false, error: 'Remboursement introuvable', code: 404 };
        await this.refundService.updateRefund(refundId, { status: RefundStatus.REJECTED });
        return { success: true, refundId };
    }
} 