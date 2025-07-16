import { Controller, Get, Param, Query, Res, HttpStatus, Inject, UseGuards, ForbiddenException, Req, NotFoundException, Put, Body, HttpException, HttpStatus as HttpStatusNest, Post, Delete } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { CategoryService } from 'src/application/services/category.service';
import { AuthGuard } from '@nestjs/passport';
import { ListActiveShopsWithStatsUseCase } from 'src/application/use-cases/shop.use-case/ListActiveShopsWithStats.use-case';
import { ProductService } from 'src/application/services/product.service';
import { ShopService } from '../../application/services/shop.service';
import { VendorService } from '../../application/services/vendor.service';
import { UpdateShopDto } from '../dtos/Shop.dto';
import { UserRole } from '../../domain/enums/UserRole.enum';

@ApiTags('Boutiques')
@ApiBearerAuth()
@Controller('shops')
export class ShopController {
    constructor(
        @Inject(ProductService) private readonly productService: ProductService,
        @Inject(CategoryService) private readonly categoryService: CategoryService,
        @Inject(ListActiveShopsWithStatsUseCase) private readonly listActiveShopsWithStatsUseCase: ListActiveShopsWithStatsUseCase,
        private readonly shopService: ShopService,
        private readonly vendorService: VendorService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer une boutique pour un vendeur', description: 'Crée une nouvelle boutique pour un vendeur existant.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Ma Boutique' },
                url: { type: 'string', example: 'ma-boutique' },
                description: { type: 'string', example: 'Boutique de produits artisanaux' },
                vendorId: { type: 'number', example: 1 }
            },
            required: ['name', 'url', 'vendorId']
        }
    })
    @ApiResponse({ status: 201, description: 'Shop créé avec succès', type: Object })
    @ApiResponse({ status: 400, description: 'Champs invalides ou manquants' })
    @ApiResponse({ status: 404, description: 'Vendeur introuvable' })
    @ApiResponse({ status: 409, description: 'URL de boutique déjà utilisée' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async createShop(@Body() body: any) {
        console.log('[ShopController] createShop', body);
        try {
            if (!body.name || !body.url || !body.vendorId) {
                throw new HttpException('Champs invalides ou manquants', HttpStatus.BAD_REQUEST);
            }
            // Vérifier que le vendeur existe
            const vendor = await this.vendorService.listVendors();
            if (!vendor.find(v => v.id === body.vendorId)) {
                throw new HttpException('Vendeur introuvable', HttpStatus.NOT_FOUND);
            }
            // Créer le shop (unicité url gérée par le service/repository)
            const shop = await this.shopService.createShop({
                name: body.name,
                url: body.url,
                description: body.description,
                vendorId: body.vendorId
            } as any);
            console.log('[ShopController] createShop SUCCESS', shop);
            return { shopId: shop.id };
        } catch (e: any) {
            if (e.code === 'P2002' || e.message?.includes('unique') || e.message?.includes('url')) {
                throw new HttpException('URL de boutique déjà utilisée', HttpStatus.CONFLICT);
            }
            console.error('[ShopController] createShop ERROR', e);
            throw new HttpException('Erreur serveur lors de la création de la boutique', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Lister les boutiques actives', description: 'Récupère la liste des boutiques actives avec leurs statistiques.' })
    @ApiResponse({ status: 200, description: 'Liste des boutiques actives', type: Object })
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
    @ApiOperation({ summary: 'Lister les produits d\'une boutique', description: 'Récupère la liste des produits d\'une boutique spécifique.' })
    @ApiParam({ name: 'id', description: 'ID de la boutique', example: 1 })
    @ApiResponse({ status: 200, description: 'Liste des produits de la boutique', type: Object })
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
    @ApiOperation({ summary: 'Lister les produits d\'une boutique filtrés par catégorie', description: 'Récupère la liste des produits d\'une boutique filtrés par catégorie.' })
    @ApiParam({ name: 'id', description: 'ID de la boutique', example: 1 })
    @ApiQuery({ name: 'category', required: true, description: 'Nom de la catégorie', example: 'Artisanat' })
    @ApiResponse({ status: 200, description: 'Liste des produits filtrés par catégorie', type: Object })
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

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/products')
    @ApiOperation({ summary: 'Lister les produits d\'un shop', description: 'Récupère la liste des produits d\'un shop spécifique.' })
    @ApiParam({ name: 'id', required: true, description: 'ID du shop', example: 1 })
    @ApiResponse({ status: 200, description: 'Liste des produits du shop', type: Object })
    @ApiResponse({ status: 404, description: 'Shop non trouvé' })
    async getShopProducts(@Param('id') id: number) {
        console.log('[ShopController] getShopProducts', { id });
        const shop = await this.shopService.findById(Number(id));
        if (!shop) {
            throw new HttpException('Shop non trouvé', HttpStatus.NOT_FOUND);
        }
        const products = await this.productService.listProducts({ shopId: Number(id) });
        console.log('[ShopController] getShopProducts SUCCESS', products);
        return products || [];
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    @ApiOperation({ summary: 'Modifier une boutique', description: 'Modifie les détails d\'une boutique existante.' })
    @ApiParam({ name: 'id', required: true, description: 'ID de la boutique à modifier', example: 1 })
    @ApiBody({ type: UpdateShopDto })
    @ApiResponse({ status: 200, description: 'Boutique mise à jour avec succès' })
    @ApiResponse({ status: 404, description: 'Boutique non trouvée' })
    @ApiResponse({ status: 409, description: 'URL déjà utilisée' })
    async updateShop(@Req() req: any, @Param('id') id: number, @Body() dto: UpdateShopDto) {
        console.log('[ShopController] updateShop', { user: req.user, id, dto });
        if (!req.user || req.user.role !== UserRole.SELLER) {
            console.error('[ShopController] updateShop FORBIDDEN', { user: req.user });
            throw new HttpException('Accès réservé aux vendeurs', HttpStatusNest.UNAUTHORIZED);
        }
        const shop = await this.shopService.findById(Number(id));
        if (!shop) {
            console.error('[ShopController] updateShop NOT FOUND shop', { id });
            throw new HttpException('Boutique non trouvée', HttpStatusNest.NOT_FOUND);
        }
        // Vérifier ownership
        const vendor = await this.vendorService.findByUserId(req.user.id);
        if (!vendor || shop.vendorId !== vendor.id) {
            console.error('[ShopController] updateShop FORBIDDEN vendor', { userId: req.user.id, vendorId: vendor?.id, shopVendorId: shop.vendorId });
            throw new HttpException('Accès interdit', HttpStatusNest.UNAUTHORIZED);
        }
        // Vérifier unicité URL si modifiée
        if (dto.url && dto.url !== shop.url) {
            const existing = await this.shopService.listShops({ url: dto.url });
            if (existing && existing.length > 0) {
                console.error('[ShopController] updateShop URL CONFLICT', { url: dto.url });
                throw new HttpException('URL déjà utilisée', HttpStatusNest.CONFLICT);
            }
        }
        await this.shopService.updateShop(Number(id), dto);
        console.log('[ShopController] updateShop SUCCESS', { id });
        return { message: 'Boutique mise à jour' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un shop (admin)', description: 'Supprime un shop spécifique. Cette action est réservée aux administrateurs.' })
    @ApiParam({ name: 'id', required: true, description: 'ID du shop à supprimer', example: 1 })
    @ApiResponse({ status: 200, description: 'Shop supprimé avec succès' })
    @ApiResponse({ status: 404, description: 'Shop non trouvé' })
    @ApiResponse({ status: 409, description: 'Shop lié à des commandes actives' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async deleteShop(@Param('id') id: number) {
        console.log('[ShopController] deleteShop', { id });
        const shop = await this.shopService.findById(Number(id));
        if (!shop) {
            throw new HttpException('Shop non trouvé', HttpStatus.NOT_FOUND);
        }
        // Vérifier s'il y a des commandes actives
        const orders = await this.shopService.getShopOrders(Number(id));
        if (orders && orders.length > 0) {
            throw new HttpException('Impossible de supprimer : commandes associées', HttpStatus.CONFLICT);
        }
        try {
            await this.shopService.deleteShop(Number(id));
            console.log('[ShopController] deleteShop SUCCESS', { id });
            return { success: true };
        } catch (e) {
            console.error('[ShopController] deleteShop ERROR', e);
            throw new HttpException('Erreur serveur lors de la suppression du shop', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}