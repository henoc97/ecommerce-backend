import { Controller, Get, Param, Query, Res, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ShopService } from 'src/application/services/shop.service';
import { CategoryService } from 'src/application/services/category.service';
import { AuthGuard } from '@nestjs/passport';
import { ListActiveShopsWithStatsUseCase } from 'src/application/use-cases/shop.use-case/ListActiveShopsWithStats.use-case';
import { ProductService } from 'src/application/services/product.service';

@ApiTags('marketplace')
@Controller('shops')
export class ShopController {
    constructor(
        @Inject(ShopService) private readonly shopService: ShopService,
        @Inject(ProductService) private readonly productService: ProductService,
        @Inject(CategoryService) private readonly categoryService: CategoryService,
        @Inject(ListActiveShopsWithStatsUseCase) private readonly listActiveShopsWithStatsUseCase: ListActiveShopsWithStatsUseCase

    ) { }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Lister les boutiques actives' })
    @ApiResponse({ status: 200, description: 'Liste des boutiques actives' })
    @ApiResponse({ status: 500, description: 'Impossible de charger les boutiques' })
    @Get('/actives')
    async listShops(@Res() res: Response) {
        console.log('[ShopController] listShops');
        try {
            const shops = await this.listActiveShopsWithStatsUseCase.execute();
            console.log('[ShopController] listShops SUCCESS', shops);
            return res.status(HttpStatus.OK).json(shops);
        } catch (error) {
            console.error('[ShopController] listShops ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Impossible de charger les boutiques' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Lister les produits d\'une boutique' })
    @ApiParam({ name: 'id', description: 'ID de la boutique' })
    @ApiResponse({ status: 200, description: 'Liste des produits de la boutique' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get('/:id/products')
    async listShopProducts(@Param('id') id: string, @Res() res: Response) {
        console.log('[ShopController] listShopProducts', { id });
        try {
            const products = await this.productService.listProducts({ shopId: Number(id) });
            console.log('[ShopController] listShopProducts SUCCESS', products);
            return res.status(HttpStatus.OK).json(products);
        } catch (error) {
            console.error('[ShopController] listShopProducts ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Lister les produits d\'une boutique filtrés par catégorie' })
    @ApiParam({ name: 'id', description: 'ID de la boutique' })
    @ApiQuery({ name: 'category', required: true, description: 'nom de la catégorie' })
    @ApiResponse({ status: 200, description: 'Liste des produits filtrés par catégorie' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get('/:id/products/by-category')
    async listShopProductsByCategorie(@Param('id') id: string, @Query('category') category: string, @Res() res: Response) {
        console.log('[ShopController] listShopProductsByCategorie', { id, category });
        try {
            const products = await this.categoryService.getShopProductsByCategory(Number(id), category);
            console.log('[ShopController] listShopProductsByCategorie SUCCESS', products);
            return res.status(HttpStatus.OK).json(products);
        } catch (error) {
            console.error('[ShopController] listShopProductsByCategorie ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }
}