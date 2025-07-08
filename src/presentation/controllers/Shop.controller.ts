import { Controller, Get, Param, Query, Res, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ShopService } from 'src/application/services/shop.service';
import { CategoryService } from 'src/application/services/category.service';
import { AuthGuard } from '@nestjs/passport';
import { ListActiveShopsWithStatsUseCase } from 'src/application/use-cases/shop.use-case/ListActiveShopsWithStats.use-case';

@ApiTags('marketplace')
@Controller('shops')
export class ShopController {
    constructor(
        @Inject(ShopService) private readonly shopService: ShopService,
        @Inject(CategoryService) private readonly categoryService: CategoryService,
        @Inject(ListActiveShopsWithStatsUseCase) private readonly listActiveShopsWithStatsUseCase: ListActiveShopsWithStatsUseCase

    ) { }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Lister les boutiques actives' })
    @ApiResponse({ status: 200, description: 'Liste des boutiques actives' })
    @ApiResponse({ status: 500, description: 'Impossible de charger les boutiques' })
    @Get('/actives')
    async listShops(@Res() res: Response) {
        try {
            const shops = await this.listActiveShopsWithStatsUseCase.execute();
            return res.status(HttpStatus.OK).json(shops);
        } catch (error) {
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
        try {
            const products = await this.shopService.getShopProducts(Number(id));
            return res.status(HttpStatus.OK).json(products);
        } catch (error) {
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
        try {
            const products = await this.categoryService.getShopProductsByCategory(Number(id), category);
            return res.status(HttpStatus.OK).json(products);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }
}