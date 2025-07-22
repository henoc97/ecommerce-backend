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
    NotFoundException,
    Query
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiBearerAuth,
    ApiQuery
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProcessPaymentUseCase } from '../../application/use-cases/payment.use-case/ProcessPayment.use-case';
import { PaymentService } from '../../application/services/payment.service';
import { CreatePaymentDto, PaymentResponseDto } from '../dtos/Payment.dto';
import { Roles } from '../../application/helpers/roles.decorator';
import { RolesGuard } from '../../application/helpers/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';


@ApiTags('Payment')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.CLIENT, UserRole.ADMIN)
@Controller('payments')
export class PaymentController {
    constructor(
        private readonly processPaymentUseCase: ProcessPaymentUseCase,
        private readonly paymentService: PaymentService,
    ) { }

    @Post()
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

    @Get()
    @ApiOperation({ summary: 'Lister les paiements', description: 'Retourne la liste des paiements, filtrable par statut, méthode ou devise.' })
    @ApiQuery({ name: 'status', required: false, description: 'Statut du paiement (SUCCESS, FAILED, PENDING, etc.)' })
    @ApiQuery({ name: 'method', required: false, description: 'Méthode de paiement (Stripe, PayPal, etc.)' })
    @ApiQuery({ name: 'currency', required: false, description: 'Devise (EUR, USD, XOF, etc.)' })
    @ApiResponse({ status: 200, description: 'Liste des paiements' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listPayments(@Query('status') status?: string, @Query('method') method?: string, @Query('currency') currency?: string) {
        console.log(`[PaymentController] listPayments status=${status} method=${method} currency=${currency}`);
        try {
            const filter: any = {};
            if (status) filter.status = status;
            if (method) filter.method = method;
            if (currency) filter.currency = currency;
            const payments = await this.paymentService.listPayments(filter);
            console.log('[PaymentController] listPayments SUCCESS', payments);
            return payments || [];
        } catch (e) {
            console.error('[PaymentController] listPayments ERROR', e);
            throw new HttpException('Erreur serveur lors de la récupération des paiements', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Détail d\'un paiement', description: 'Retourne le détail complet d\'un paiement, avec lien vers la commande et le client.' })
    @ApiParam({ name: 'id', required: true, description: 'ID du paiement' })
    @ApiResponse({ status: 200, description: 'Détail du paiement' })
    @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getPaymentDetail(@Param('id') id: number) {
        console.log(`[PaymentController] getPaymentDetail id=${id}`);
        try {
            const payment = await this.paymentService.getPaymentDetail(Number(id));
            if (!payment) {
                console.error('Paiement non trouvé');
                throw new HttpException('Paiement non trouvé', HttpStatus.NOT_FOUND);
            }
            console.log('[PaymentController] getPaymentDetail SUCCESS', payment);
            return payment;
        } catch (e) {
            console.error('[PaymentController] getPaymentDetail ERROR', e);
            throw new HttpException('Erreur serveur lors de la récupération du détail du paiement', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:id')
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