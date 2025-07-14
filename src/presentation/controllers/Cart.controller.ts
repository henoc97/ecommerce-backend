import { Controller, Post, Put, Delete, Get, Param, Query, Body, Res, HttpStatus, UseGuards, Req, Inject } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiProperty } from '@nestjs/swagger';
import { CartService } from 'src/application/services/cart.service';
import { CartItemService } from 'src/application/services/cartitem.service';
import { AuthGuard } from '@nestjs/passport';
import { AddProductToCartUseCase } from 'src/application/use-cases/cart.use-case/addProductToCart.use-case';
import { UpdateCartItemQuantityUseCase } from 'src/application/use-cases/cart.use-case/updateCartItemQuantity.use-case';
import { AddCartItemDto, UpdateCartItemDto } from '../dtos/CartItem.dot';

@ApiTags('cart')
@Controller('cart')
export class CartController {
    constructor(
        @Inject(CartService) private readonly cartService: CartService,
        @Inject(CartItemService) private readonly cartItemService: CartItemService,
        @Inject(AddProductToCartUseCase) private readonly addProductToCartUseCase: AddProductToCartUseCase,
        @Inject(UpdateCartItemQuantityUseCase) private readonly updateCartItemQuantityUseCase: UpdateCartItemQuantityUseCase
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Ajouter un produit au panier' })
    @ApiBody({ type: AddCartItemDto })
    @ApiResponse({ status: 200, description: 'Produit ajouté au panier' })
    @ApiResponse({ status: 409, description: 'Produit déjà dans le panier' })
    @ApiResponse({ status: 400, description: 'Stock insuffisant' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Post('items')
    async addCartItem(@Body() body: AddCartItemDto, @Req() req: any, @Res() res: Response) {
        try {
            const userId = req.user.id;
            const result = await this.addProductToCartUseCase.execute(userId, body.productId, body.quantity);
            if (result === 'conflict') {
                return res.status(HttpStatus.CONFLICT).json({ message: 'Produit déjà dans le panier' });
            }
            if (result === 'stock') {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Stock insuffisant' });
            }
            return res.status(HttpStatus.OK).json({ message: 'Produit ajouté au panier' });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Modifier la quantité d\'un article du panier' })
    @ApiParam({ name: 'id', description: 'ID du CartItem' })
    @ApiBody({ type: UpdateCartItemDto })
    @ApiResponse({ status: 200, description: 'Quantité mise à jour' })
    @ApiResponse({ status: 400, description: 'Stock insuffisant' })
    @ApiResponse({ status: 404, description: 'Élément introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Put('items/:id')
    async updateCartItem(@Param('id') id: string, @Body() body: UpdateCartItemDto, @Req() req: any, @Res() res: Response) {
        try {
            const userId = req.user.id;
            const result = await this.updateCartItemQuantityUseCase.execute(Number(id), body.newQuantity);
            if (result === 'not_found') {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Élément introuvable' });
            }
            if (result === 'stock') {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Stock insuffisant' });
            }
            return res.status(HttpStatus.OK).json({ message: 'Quantité mise à jour' });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Supprimer un article du panier' })
    @ApiParam({ name: 'id', description: 'ID du CartItem' })
    @ApiResponse({ status: 200, description: 'Article retiré du panier' })
    @ApiResponse({ status: 403, description: 'Suppression interdite' })
    @ApiResponse({ status: 404, description: 'Élément introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Delete('items/:id')
    async deleteCartItem(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
        try {
            const userId = req.user.id;
            const result = await this.cartItemService.deleteItem(Number(id));
            if (result === 'not_found') {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Élément introuvable' });
            }
            return res.status(HttpStatus.OK).json({ message: 'Article retiré du panier' });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Lister les paniers d\'un utilisateur' })
    @ApiQuery({ name: 'userId', required: true, description: 'ID de l\'utilisateur' })
    @ApiResponse({ status: 200, description: 'Liste des paniers' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get('carts')
    async listCarts(@Query('userId') userId: string, @Res() res: Response) {
        try {
            const carts = await this.cartService.listCartsByUser(Number(userId));
            return res.status(HttpStatus.OK).json(carts);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Voir le détail d\'un panier' })
    @ApiParam({ name: 'id', description: 'ID du panier' })
    @ApiResponse({ status: 200, description: 'Détail du panier' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get('carts/:id')
    async getCart(@Param('id') id: string, @Res() res: Response) {
        try {
            const cart = await this.cartService.getCartDetails(Number(id));
            return res.status(HttpStatus.OK).json(cart);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }
}