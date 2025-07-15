import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CategoryService } from '../../application/services/category.service';
import { CategoryCreateDto, CategoryUpdateDto, CategoryResponseDto } from '../dtos/Category.dto';
import { ApiTags, ApiResponse, ApiQuery, ApiParam, ApiBody, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Catégories')
@ApiBearerAuth()
@Controller('/categories')
export class CategoryController {
    private readonly logger = new Logger(CategoryController.name);

    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    @ApiOperation({ summary: 'Lister les catégories d’une boutique', description: 'Retourne la liste des catégories pour une boutique donnée.' })
    @ApiQuery({ name: 'shopId', required: true, type: Number, description: 'ID de la boutique' })
    @ApiResponse({ status: 200, description: 'Liste des catégories', type: [CategoryResponseDto] })
    @ApiResponse({ status: 400, description: 'shopId requis' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getCategories(@Query('shopId') shopId: number) {
        this.logger.log(`GET /categories?shopId=${shopId}`);
        try {
            if (!shopId) {
                this.logger.error('shopId manquant');
                throw new HttpException('shopId requis', HttpStatus.BAD_REQUEST);
            }
            const categories = await this.categoryService.listCategories(Number(shopId));
            this.logger.log('Catégories récupérées avec succès');
            return categories;
        } catch (error) {
            this.logger.error('Erreur lors du chargement des catégories', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/all')
    @ApiOperation({ summary: 'Lister toutes les catégories', description: 'Retourne la liste globale de toutes les catégories (usage admin).' })
    @ApiResponse({ status: 200, description: 'Liste globale des catégories', type: [CategoryResponseDto] })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getAllCategories() {
        this.logger.log('GET /categories/all (global)');
        try {
            const categories = await this.categoryService.listCategories();
            this.logger.log('Catégories globales récupérées avec succès');
            return categories;
        } catch (error) {
            this.logger.error('Erreur lors du chargement des catégories globales', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post()
    @ApiOperation({ summary: 'Créer une catégorie', description: 'Crée une nouvelle catégorie pour une boutique.' })
    @ApiBody({ type: CategoryCreateDto, description: 'Payload de création de catégorie' })
    @ApiResponse({ status: 201, description: 'Catégorie créée', type: CategoryResponseDto })
    @ApiResponse({ status: 409, description: 'Nom déjà utilisé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async createCategory(@Body() dto: CategoryCreateDto) {
        this.logger.log(`POST /category body=${JSON.stringify(dto)}`);
        try {
            // Vérifier unicité du nom pour le shop
            const existing = await this.categoryService.listCategories(dto.shopId);
            if (existing.some(cat => cat.name.toLowerCase() === dto.name.toLowerCase())) {
                this.logger.error('Nom déjà utilisé');
                throw new HttpException('Nom déjà utilisé', HttpStatus.CONFLICT);
            }
            const created = await this.categoryService.createCategory(dto as any);
            this.logger.log('Catégorie ajoutée avec succès');
            return created;
        } catch (error) {
            this.logger.error('Erreur lors de la création', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('/:id')
    @ApiOperation({ summary: 'Mettre à jour une catégorie', description: 'Modifie une catégorie existante.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la catégorie à modifier' })
    @ApiBody({ type: CategoryUpdateDto, description: 'Payload de mise à jour' })
    @ApiResponse({ status: 200, description: 'Catégorie modifiée', type: CategoryResponseDto })
    @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
    @ApiResponse({ status: 409, description: 'Nom déjà utilisé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async updateCategory(@Param('id') id: number, @Body() dto: CategoryUpdateDto) {
        this.logger.log(`PUT /category/${id} body=${JSON.stringify(dto)}`);
        try {
            const category = await this.categoryService.findById(Number(id));
            if (!category) {
                this.logger.error('Catégorie non trouvée');
                throw new HttpException('Catégorie non trouvée', HttpStatus.NOT_FOUND);
            }
            // Vérifier conflit de nom si modifié
            if (dto.name) {
                const siblings = await this.categoryService.listCategories(category.shopId);
                if (siblings.some(cat => cat.name.toLowerCase() === dto.name.toLowerCase() && cat.id !== Number(id))) {
                    this.logger.error('Nom déjà utilisé');
                    throw new HttpException('Nom déjà utilisé', HttpStatus.CONFLICT);
                }
            }
            const updated = await this.categoryService.updateCategory(Number(id), dto as any);
            this.logger.log('Catégorie modifiée avec succès');
            return updated;
        } catch (error) {
            this.logger.error('Erreur lors de la modification', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Supprimer une catégorie', description: 'Supprime une catégorie si elle ne contient plus de produits.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la catégorie à supprimer' })
    @ApiResponse({ status: 200, description: 'Catégorie supprimée' })
    @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
    @ApiResponse({ status: 400, description: 'Supprimez d’abord les produits de cette catégorie' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async deleteCategory(@Param('id') id: number) {
        this.logger.log(`DELETE /category/${id}`);
        try {
            // Vérifier s'il reste des produits liés
            const category = await this.categoryService.findById(Number(id));
            if (!category) {
                this.logger.error('Catégorie non trouvée');
                throw new HttpException('Catégorie non trouvée', HttpStatus.NOT_FOUND);
            }
            if (category.products && category.products.length > 0) {
                this.logger.error('Catégorie non vide');
                throw new HttpException('Supprimez d’abord les produits de cette catégorie', HttpStatus.BAD_REQUEST);
            }
            await this.categoryService.deleteCategory(Number(id));
            this.logger.log('Catégorie supprimée avec succès');
            return { message: 'Catégorie supprimée' };
        } catch (error) {
            this.logger.error('Erreur lors de la suppression', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 