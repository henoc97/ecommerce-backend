import { Controller, Post, Get, Param, Query, Body, Res, HttpStatus, UseGuards, Req, Inject } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiProperty } from '@nestjs/swagger';
import { OrderService } from 'src/application/services/order.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order.use-case/CreateOrderFromCart.use-case';
import { CreateOrderDto } from '../dtos/Order.dto';


@ApiTags('orders')
@Controller('orders')
export class OrderController {
    constructor(
        @Inject(OrderService) private readonly orderService: OrderService,
        @Inject(CreateOrderFromCartUseCase) private readonly createOrderFromCartUseCase: CreateOrderFromCartUseCase
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Créer une commande à partir du panier' })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({ status: 201, description: 'Commande créée' })
    @ApiResponse({ status: 400, description: 'Erreur panier vide, stock, produit supprimé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Post()
    async createOrder(@Body() body: CreateOrderDto, @Req() req: any, @Res() res: Response) {
        try {
            const userId = req.user.id;
            const result = await this.createOrderFromCartUseCase.execute(userId, body.shopId, body.paymentId);
            if (result.error) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: result.error, details: result.details });
            }
            return res.status(HttpStatus.CREATED).json({ orderId: result.orderId });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Lister les commandes d\'un utilisateur' })
    @ApiQuery({ name: 'userId', required: true, description: 'ID de l\'utilisateur' })
    @ApiResponse({ status: 200, description: 'Liste des commandes' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get()
    async listOrders(@Query('userId') userId: string, @Res() res: Response) {
        try {
            const orders = await this.orderService.listOrders({ userId: Number(userId) });
            return res.status(HttpStatus.OK).json(orders);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Détails d\'une commande' })
    @ApiParam({ name: 'id', description: 'ID de la commande' })
    @ApiResponse({ status: 200, description: 'Détail de la commande' })
    @ApiResponse({ status: 403, description: 'Commande non autorisée' })
    @ApiResponse({ status: 404, description: 'Commande introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get(':id')
    async getOrder(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
        try {
            const userId = req.user.id;
            const order = await this.orderService.findById(Number(id));
            if (!order) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Commande introuvable' });
            }
            if (order.userId !== userId) {
                return res.status(HttpStatus.FORBIDDEN).json({ message: 'Commande non autorisée' });
            }
            return res.status(HttpStatus.OK).json(order);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }
} 