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
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProcessPaymentUseCase } from '../../application/use-cases/payment.use-case/ProcessPayment.use-case';
import { PaymentService } from '../../application/services/payment.service';
import { CreatePaymentDto, PaymentResponseDto } from '../dtos/Payment.dto';


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
        console.log('[PaymentController] processPayment', { userId: req.user?.id, dto });
        try {
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

            const response = {
                success: true,
                payment: result.payment
            };
            console.log('[PaymentController] processPayment SUCCESS', response);
            return response;
        } catch (e) {
            console.error('[PaymentController] processPayment ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
        console.log('[PaymentController] getPaymentByOrderId', { userId: req.user?.id, orderId });
        try {
            const payment = await this.paymentService.getOrderPayment(Number(orderId));

            if (!payment) {
                throw new NotFoundException('Aucun paiement trouvé pour cette commande');
            }

            console.log('[PaymentController] getPaymentByOrderId SUCCESS', payment);
            return payment;
        } catch (e) {
            console.error('[PaymentController] getPaymentByOrderId ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
        console.log('[PaymentController] getUserPayments', { userId });
        try {
            const payments = await this.paymentService.getUserPayments(userId);
            console.log('[PaymentController] getUserPayments SUCCESS', payments);
            return payments;
        } catch (e) {
            console.error('[PaymentController] getUserPayments ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:shopId')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Lister les paiements d\'une boutique',
        description: 'Retourne tous les paiements associés à une boutique spécifique.'
    })
    @ApiParam({
        name: 'shopId',
        description: 'ID de la boutique',
        type: 'number',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Liste des paiements de la boutique',
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
    @ApiResponse({
        status: 404,
        description: 'Aucun paiement trouvé pour cette boutique',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Aucun paiement trouvé' },
                error: { type: 'string', example: 'Not Found' }
            }
        }
    })
    async getShopPayments(@Param('shopId') shopId: string) {
        console.log('[PaymentController] getShopPayments', { shopId });
        try {
            const payments = await this.paymentService.getShopPayments(Number(shopId));
            if (!payments || payments.length === 0) {
                throw new NotFoundException('Aucun paiement trouvé pour cette boutique');
            }
            console.log('[PaymentController] getShopPayments SUCCESS', payments);
            return payments;
        } catch (e) {
            console.error('[PaymentController] getShopPayments ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Détails d\'un paiement',
        description: 'Retourne les détails d\'un paiement à partir de son ID.'
    })
    @ApiParam({
        name: 'id',
        description: 'ID du paiement',
        type: 'number',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Détails du paiement',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                status: { type: 'string' },
                method: { type: 'string' },
                amount: { type: 'number' },
                currency: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                orderId: { type: 'number' },
                providerId: { type: 'string' },
                metadata: { type: 'object' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Aucun paiement trouvé avec cet ID',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Aucun paiement trouvé' },
                error: { type: 'string', example: 'Not Found' }
            }
        }
    })
    async getPaymentById(@Param('id') id: string) {
        console.log('[PaymentController] getPaymentById', { id });
        try {
            const payment = await this.paymentService.findById(Number(id));
            if (!payment) {
                throw new NotFoundException('Aucun paiement trouvé avec cet ID');
            }
            console.log('[PaymentController] getPaymentById SUCCESS', payment);
            return payment;
        } catch (e) {
            console.error('[PaymentController] getPaymentById ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 