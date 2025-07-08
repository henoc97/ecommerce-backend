import { Controller, Get, Param, Query, Res, HttpStatus, Inject } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductService } from 'src/application/services/product.service';
import { CategoryService } from 'src/application/services/category.service';

@ApiTags('marketplace')
@Controller('products')
export class ShopProductController {
    constructor(
        @Inject(ProductService) private readonly productService: ProductService,
        @Inject(CategoryService) private readonly categoryService: CategoryService
    ) { }

    @ApiOperation({ summary: 'Lister les produits d\'une catégorie' })
    @ApiQuery({ name: 'category', required: true, description: 'Nom de la catégorie' })
    @ApiResponse({ status: 200, description: 'Liste des produits de la catégorie' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get('/by-category')
    async listProductsByCategory(@Query('category') category: string, @Res() res: Response) {
        try {
            const products = await this.categoryService.listProductsByCategory(category);
            return res.status(HttpStatus.OK).json(products);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @ApiOperation({ summary: 'Détails d\'un produit (avec variantes et promotions)' })
    @ApiParam({ name: 'id', description: 'ID du produit' })
    @ApiResponse({ status: 200, description: 'Détails du produit' })
    @ApiResponse({ status: 404, description: 'Produit introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get('/:id')
    async getProductDetails(@Param('id') id: string, @Res() res: Response) {
        try {
            const product = await this.productService.findById(Number(id));
            if (!product) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Produit introuvable' });
            }
            return res.status(HttpStatus.OK).json(product);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }
} 