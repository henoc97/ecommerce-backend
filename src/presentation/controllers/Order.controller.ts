import { Controller, Post, Get, Param, Query, Body, Res, HttpStatus, UseGuards, Req, Inject, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from 'src/application/services/order.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order.use-case/CreateOrderFromCart.use-case';
import { CreateOrderDto } from '../dtos/Order.dto';
import { Logger } from '@nestjs/common';
import { Roles } from '../../application/helper/roles.decorator';
import { RolesGuard } from '../../application/helper/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';


@ApiTags('Commandes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.CLIENT, UserRole.ADMIN)
@Controller('orders')
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(
        @Inject(OrderService) private readonly orderService: OrderService,
        @Inject(CreateOrderFromCartUseCase) private readonly createOrderFromCartUseCase: CreateOrderFromCartUseCase
    ) { }

    @ApiOperation({ summary: 'Créer une commande à partir du panier', description: 'Cette route permet de créer une nouvelle commande à partir des articles présents dans le panier de l\'utilisateur.' })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({ status: 201, description: 'Commande créée avec succès', })
    @ApiResponse({ status: 400, description: 'Erreur panier vide, stock, produit supprimé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Post()
    async createOrder(@Body() body: CreateOrderDto, @Req() req: any, @Res() res: Response) {
        console.log('[OrderController] createOrder', { userId: req.user?.id, body });
        try {
            const userId = req.user.id;
            // On ne passe plus paymentId ici
            const result = await this.createOrderFromCartUseCase.execute(userId, body.shopId);
            if (result.error) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: result.error, details: result.details });
            }
            console.log('[OrderController] createOrder SUCCESS', result);
            return res.status(HttpStatus.CREATED).json({ orderId: result.orderId });
        } catch (error) {
            console.error('[OrderController] createOrder ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @Get()
    @ApiOperation({ summary: 'Lister les commandes', description: 'Retourne la liste des commandes, filtrable par statut, boutique ou utilisateur.' })
    @ApiQuery({ name: 'status', required: false, description: 'Statut de la commande (PENDING, DELIVERED, etc.)' })
    @ApiQuery({ name: 'shopId', required: false, description: 'ID de la boutique' })
    @ApiQuery({ name: 'userId', required: false, description: 'ID de l\'utilisateur' })
    @ApiResponse({ status: 200, description: 'Liste des commandes' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listOrders(@Query('status') status?: string, @Query('shopId') shopId?: string, @Query('userId') userId?: string) {
        this.logger.log(`[OrderController] listOrders status=${status} shopId=${shopId} userId=${userId}`);
        try {
            const filter: any = {};
            if (status) filter.status = status;
            if (shopId) filter.shopId = Number(shopId);
            if (userId) filter.userId = Number(userId);
            const orders = await this.orderService.listOrders(filter);
            this.logger.log('[OrderController] listOrders SUCCESS', orders);
            return orders || [];
        } catch (e) {
            this.logger.error('[OrderController] listOrders ERROR', e);
            throw new HttpException('Erreur serveur lors de la récupération des commandes', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Détail d\'une commande', description: 'Retourne le détail complet d\'une commande (items, client, paiement, etc.).' })
    @ApiParam({ name: 'id', required: true, description: 'ID de la commande' })
    @ApiResponse({ status: 200, description: 'Détail de la commande' })
    @ApiResponse({ status: 404, description: 'Commande non trouvée' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getOrderDetail(@Param('id') id: number) {
        this.logger.log(`[OrderController] getOrderDetail id=${id}`);
        try {
            const order = await this.orderService.findById(Number(id));
            if (!order) {
                this.logger.error('Commande non trouvée');
                throw new HttpException('Commande non trouvée', HttpStatus.NOT_FOUND);
            }
            this.logger.log('[OrderController] getOrderDetail SUCCESS', order);
            return order;
        } catch (e) {
            this.logger.error('[OrderController] getOrderDetail ERROR', e);
            throw new HttpException('Erreur serveur lors de la récupération du détail de la commande', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 