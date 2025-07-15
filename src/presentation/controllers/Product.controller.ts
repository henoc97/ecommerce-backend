import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { ProductService } from '../../application/services/product.service';
import { ProductCreateDto, ProductUpdateDto, ProductResponseDto } from '../dtos/Product.dto';
import { ApiTags, ApiResponse, ApiQuery, ApiParam, ApiBody, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Produits')
@ApiBearerAuth()
@Controller('/products')
export class ProductController {
    private readonly logger = new Logger(ProductController.name);

    constructor(
        @Inject(ProductService) private readonly productService: ProductService) { }

    @Get()
    @ApiOperation({ summary: 'Lister les produits', description: 'Retourne la liste des produits filtrés par boutique (shopId) et/ou catégorie (categoryId).' })
    @ApiQuery({ name: 'shopId', required: false, type: Number, description: 'ID de la boutique (optionnel)' })
    @ApiQuery({ name: 'categoryId', required: false, type: Number, description: 'ID de la catégorie (optionnel)' })
    @ApiResponse({ status: 200, description: 'Liste des produits', type: [ProductResponseDto] })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getProducts(@Query('shopId') shopId?: number, @Query('categoryId') categoryId?: number): Promise<ProductResponseDto[]> {
        this.logger.log(`GET /products?shopId=${shopId}&categoryId=${categoryId}`);
        try {
            const filter: any = {};
            if (shopId) filter.shopId = Number(shopId);
            if (categoryId) filter.categoryId = Number(categoryId);
            const products = await this.productService.listProducts(filter);
            this.logger.log('Produits récupérés avec succès');
            return products;
        } catch (error) {
            this.logger.error('Erreur lors du chargement des produits', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Détail d’un produit', description: 'Retourne le détail d’un produit, avec variantes et images.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID du produit' })
    @ApiResponse({ status: 200, description: 'Détail du produit', type: ProductResponseDto })
    @ApiResponse({ status: 404, description: 'Produit introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getProductDetail(@Param('id') id: number): Promise<any> {
        this.logger.log(`GET /products/${id}`);
        try {
            const product = await this.productService.getProductWithVariantsImages(Number(id));
            if (!product) {
                this.logger.error('Produit introuvable');
                throw new HttpException('Produit introuvable', HttpStatus.NOT_FOUND);
            }
            return product;
        } catch (error) {
            this.logger.error('Erreur lors de la récupération du produit', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post()
    @ApiOperation({ summary: 'Créer un produit', description: 'Crée un nouveau produit dans une boutique.' })
    @ApiBody({ type: ProductCreateDto, description: 'Payload de création de produit' })
    @ApiResponse({ status: 201, description: 'Produit créé', type: ProductResponseDto })
    @ApiResponse({ status: 400, description: 'Conflit de contrainte (doublon)' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
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
    @ApiOperation({ summary: 'Mettre à jour un produit', description: 'Modifie les informations d’un produit existant.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID du produit à modifier' })
    @ApiBody({ type: ProductUpdateDto, description: 'Payload de mise à jour' })
    @ApiResponse({ status: 200, description: 'Produit mis à jour', type: ProductResponseDto })
    @ApiResponse({ status: 404, description: 'Produit introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
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
    @ApiOperation({ summary: 'Supprimer un produit', description: 'Supprime un produit s’il n’est pas lié à des commandes ou reviews.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID du produit à supprimer' })
    @ApiResponse({ status: 200, description: 'Produit supprimé' })
    @ApiResponse({ status: 404, description: 'Produit introuvable' })
    @ApiResponse({ status: 409, description: 'Impossible de supprimer le produit (lié à des commandes ou reviews)' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async deleteProduct(@Param('id') id: number): Promise<{ message: string }> {
        this.logger.log(`DELETE /product/${id}`);
        try {
            const existing = await this.productService.findById(Number(id));
            if (!existing) {
                this.logger.error('Produit introuvable');
                throw new HttpException('Produit introuvable', HttpStatus.NOT_FOUND);
            }
            // Vérification dépendances (ex: commandes, reviews, etc.)
            // À adapter selon la logique métier réelle
            const hasRelations = await this.productService.hasProductRelations(Number(id));
            if (hasRelations) {
                this.logger.error('Produit lié à des commandes ou reviews, suppression impossible');
                throw new HttpException('Impossible de supprimer le produit (lié à des commandes ou reviews)', HttpStatus.CONFLICT);
            }
            await this.productService.deleteProduct(Number(id));
            this.logger.log('Produit supprimé avec succès');
            return { message: 'Produit supprimé' };
        } catch (error) {
            this.logger.error('Erreur lors de la suppression du produit', error.stack);
            if (error.status === HttpStatus.CONFLICT) throw error;
            if (error.code === 'P2003') {
                throw new HttpException('Impossible de supprimer le produit (conflit de relation)', HttpStatus.CONFLICT);
            }
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 