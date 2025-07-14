import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { ProductService } from '../../application/services/product.service';
import { ProductCreateDto, ProductUpdateDto, ProductResponseDto } from '../dtos/Product.dto';
import { ApiTags, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Product')
@Controller('/products')
export class ProductController {
    private readonly logger = new Logger(ProductController.name);

    constructor(
        @Inject(ProductService) private readonly productService: ProductService) { }

    @Get()
    @ApiQuery({ name: 'shopId', required: true, type: Number })
    @ApiResponse({ status: 200, description: 'Liste des produits', type: [ProductResponseDto] })
    async getProducts(@Query('shopId') shopId: number): Promise<ProductResponseDto[]> {
        this.logger.log(`GET /products?shopId=${shopId}`);
        try {
            if (!shopId) {
                this.logger.error('shopId manquant');
                throw new HttpException('shopId requis', HttpStatus.BAD_REQUEST);
            }
            const products = await this.productService.listProducts({ shopId: Number(shopId) });
            this.logger.log('Produits récupérés avec succès');
            return products;
        } catch (error) {
            this.logger.error('Erreur lors du chargement des produits', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post()
    @ApiBody({ type: ProductCreateDto })
    @ApiResponse({ status: 201, description: 'Produit créé', type: ProductResponseDto })
    async createProduct(@Body() dto: ProductCreateDto): Promise<ProductResponseDto> {
        this.logger.log('POST /product', JSON.stringify(dto));
        try {
            const product = await this.productService.createProduct(dto as any);
            this.logger.log('Produit créé avec succès', JSON.stringify(product));
            return product;
        } catch (error) {
            this.logger.error('Erreur lors de la création du produit', error.stack);
            if (error.code === 'P2002') {
                throw new HttpException('Conflit de contrainte (doublon)', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: ProductUpdateDto })
    @ApiResponse({ status: 200, description: 'Produit mis à jour', type: ProductResponseDto })
    async updateProduct(@Param('id') id: number, @Body() dto: ProductUpdateDto): Promise<ProductResponseDto> {
        this.logger.log(`PUT /product/${id}`, JSON.stringify(dto));
        try {
            const existing = await this.productService.findById(Number(id));
            if (!existing) {
                this.logger.error('Produit introuvable');
                throw new HttpException('Produit introuvable', HttpStatus.NOT_FOUND);
            }
            const updated = await this.productService.updateProduct(Number(id), dto as any);
            this.logger.log('Produit mis à jour avec succès', JSON.stringify(updated));
            return updated;
        } catch (error) {
            this.logger.error('Erreur lors de la modification du produit', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Produit supprimé' })
    async deleteProduct(@Param('id') id: number): Promise<{ message: string }> {
        this.logger.log(`DELETE /product/${id}`);
        try {
            const existing = await this.productService.findById(Number(id));
            if (!existing) {
                this.logger.error('Produit introuvable');
                throw new HttpException('Produit introuvable', HttpStatus.NOT_FOUND);
            }
            await this.productService.deleteProduct(Number(id));
            this.logger.log('Produit supprimé avec succès');
            return { message: 'Produit supprimé' };
        } catch (error) {
            this.logger.error('Erreur lors de la suppression du produit', error.stack);
            if (error.code === 'P2003') {
                throw new HttpException('Impossible de supprimer le produit (conflit de relation)', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 