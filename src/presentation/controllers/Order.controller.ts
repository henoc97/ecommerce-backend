import { Controller, Post, Get, Param, Query, Body, Res, HttpStatus, UseGuards, Req, Inject } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from 'src/application/services/order.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order.use-case/CreateOrderFromCart.use-case';
import { CreateOrderDto } from '../dtos/Order.dto';


@ApiTags('Commandes')
@ApiBearerAuth()
@Controller('orders')
export class OrderController {
    constructor(
        @Inject(OrderService) private readonly orderService: OrderService,
        @Inject(CreateOrderFromCartUseCase) private readonly createOrderFromCartUseCase: CreateOrderFromCartUseCase
    ) { }

    @UseGuards(AuthGuard('jwt'))
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
            const result = await this.createOrderFromCartUseCase.execute(userId, body.shopId, body.paymentId);
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

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Lister les commandes par utilisateur ou par boutique', description: 'Cette route permet de lister toutes les commandes d\'un utilisateur ou de toutes les commandes d\'une boutique.' })
    @ApiQuery({ name: 'userId', required: false, description: 'ID de l\'utilisateur pour filtrer les commandes de cet utilisateur. Si non fourni, la liste sera de toutes les commandes.' })
    @ApiQuery({ name: 'shopId', required: false, description: 'ID de la boutique pour filtrer les commandes de cette boutique. Si non fourni, la liste sera de toutes les commandes.' })
    @ApiResponse({ status: 200, description: 'Liste des commandes filtrées' })
    @ApiResponse({ status: 400, description: 'Aucun paramètre fourni pour la recherche' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get()
    async listOrders(@Query('userId') userId: string, @Query('shopId') shopId: string, @Res() res: Response) {
        console.log('[OrderController] listOrders', { userId, shopId });
        try {
            if (!userId && !shopId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Veuillez fournir userId ou shopId' });
            }
            const filter: any = {};
            if (userId) filter.userId = Number(userId);
            if (shopId) filter.shopId = Number(shopId);
            const orders = await this.orderService.listOrders(filter);
            console.log('[OrderController] listOrders SUCCESS', orders);
            return res.status(HttpStatus.OK).json(orders);
        } catch (error) {
            console.error('[OrderController] listOrders ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Détails d\'une commande', description: 'Cette route permet de récupérer les détails d\'une commande spécifique.' })
    @ApiParam({ name: 'id', description: 'ID de la commande à récupérer' })
    @ApiResponse({ status: 200, description: 'Détail de la commande' })
    @ApiResponse({ status: 403, description: 'Commande non autorisée' })
    @ApiResponse({ status: 404, description: 'Commande introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get(':id')
    async getOrder(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
        console.log('[OrderController] getOrder', { userId: req.user?.id, id });
        try {
            const userId = req.user.id;
            const order = await this.orderService.findById(Number(id));
            if (!order) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Commande introuvable' });
            }
            if (order.userId !== userId) {
                return res.status(HttpStatus.FORBIDDEN).json({ message: 'Commande non autorisée' });
            }
            console.log('[OrderController] getOrder SUCCESS', order);
            return res.status(HttpStatus.OK).json(order);
        } catch (error) {
            console.error('[OrderController] getOrder ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }
} 