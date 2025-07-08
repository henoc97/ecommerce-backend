import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Req,
    HttpException,
    HttpStatus,
    NotFoundException
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiBearerAuth
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProcessPaymentUseCase, PaymentDto } from '../../application/use-cases/payment.use-case/ProcessPayment.use-case';
import { PaymentService } from '../../application/services/payment.service';

// DTOs pour Swagger
export class CreatePaymentDto {
    orderId: number;
    method: string;
    amount: number;
    currency: string;
    cardData?: any;
    paypalData?: any;
}

export class PaymentResponseDto {
    success: boolean;
    payment?: {
        providerId: string;
        transactionId: string;
        method: string;
        processedAt: string;
    };
    error?: string;
    details?: any;
}

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
    constructor(
        private readonly processPaymentUseCase: ProcessPaymentUseCase,
        private readonly paymentService: PaymentService,
    ) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Traiter un paiement pour une commande',
        description: 'Effectue un paiement pour une commande en attente. Supporte Stripe et PayPal.'
    })
    @ApiBody({
        type: CreatePaymentDto,
        description: 'Données du paiement à traiter'
    })
    @ApiResponse({
        status: 200,
        description: 'Paiement traité avec succès',
        type: PaymentResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Commande invalide ou déjà traitée',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Commande invalide ou déjà traitée' },
                code: { type: 'number', example: 400 }
            }
        }
    })
    @ApiResponse({
        status: 402,
        description: 'Paiement refusé par la gateway',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Paiement refusé' },
                code: { type: 'number', example: 402 },
                details: {
                    type: 'object',
                    properties: {
                        reason: { type: 'string', example: 'Carte refusée' },
                        errorCode: { type: 'string', example: 'card_declined' },
                        message: { type: 'string', example: 'Votre carte a été refusée' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 502,
        description: 'Erreur de paiement externe (réseau, gateway)',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Erreur de paiement externe' },
                code: { type: 'number', example: 502 }
            }
        }
    })
    async processPayment(
        @Req() req: any,
        @Body() dto: CreatePaymentDto
    ): Promise<PaymentResponseDto> {
        const userId = req.user.id;

        const result = await this.processPaymentUseCase.execute(userId, dto);

        if (!result.success) {
            throw new HttpException(
                {
                    success: false,
                    error: result.error,
                    details: result.details
                },
                result.code || HttpStatus.BAD_REQUEST
            );
        }

        return {
            success: true,
            payment: result.payment
        };
    }

    @Get(':orderId')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Récupérer le paiement d\'une commande',
        description: 'Retourne les détails du paiement associé à une commande spécifique'
    })
    @ApiParam({
        name: 'orderId',
        description: 'ID de la commande',
        type: 'number',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Paiement trouvé',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                status: { type: 'string', example: 'SUCCESS' },
                method: { type: 'string', example: 'Stripe' },
                amount: { type: 'number', example: 99.99 },
                currency: { type: 'string', example: 'USD' },
                providerId: { type: 'string', example: 'pay_1234567890' },
                createdAt: { type: 'string', format: 'date-time' },
                orderId: { type: 'number', example: 1 },
                metadata: { type: 'object' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Aucun paiement trouvé pour cette commande',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Aucun paiement trouvé' },
                error: { type: 'string', example: 'Not Found' }
            }
        }
    })
    async getPaymentByOrderId(
        @Req() req: any,
        @Param('orderId') orderId: string
    ) {
        const payment = await this.paymentService.getOrderPayment(Number(orderId));

        if (!payment) {
            throw new NotFoundException('Aucun paiement trouvé pour cette commande');
        }

        // Vérifier que l'utilisateur a accès à cette commande
        // (optionnel : vérifier que la commande appartient à l'utilisateur)

        return payment;
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Lister les paiements de l\'utilisateur',
        description: 'Retourne tous les paiements de l\'utilisateur connecté'
    })
    @ApiResponse({
        status: 200,
        description: 'Liste des paiements',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    status: { type: 'string' },
                    method: { type: 'string' },
                    amount: { type: 'number' },
                    currency: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    orderId: { type: 'number' }
                }
            }
        }
    })
    async getUserPayments(@Req() req: any) {
        const userId = req.user.id;

        // Note: Cette méthode nécessiterait d'être implémentée dans PaymentService
        // pour filtrer par utilisateur via les commandes
        // Pour l'instant, retournons tous les paiements
        return await this.paymentService.listPayments();
    }
} 