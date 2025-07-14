import { Controller, Post, Body, Param, HttpException, HttpStatus, Logger, UseGuards, Req, Inject } from '@nestjs/common';
import { ProductVariantService } from '../../application/services/productvariant.service';
import { ProductImageService } from '../../application/services/productimage.service';
import { ProductService } from '../../application/services/product.service';
import { VendorService } from '../../application/services/vendor.service';
import { ProductVariantCreateDto, ProductVariantResponseDto, ProductImageCreateDto } from '../dtos/Product.dto';
import { ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../domain/enums/UserRole.enum';

@ApiTags('ProductVariant')
@Controller()
export class ProductVariantController {
    private readonly logger = new Logger(ProductVariantController.name);

    constructor(
        @Inject(ProductVariantService) private readonly productVariantService: ProductVariantService,
        @Inject(ProductImageService) private readonly productImageService: ProductImageService,
        @Inject(ProductService) private readonly productService: ProductService,
        @Inject(VendorService) private readonly vendorService: VendorService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('/product/:id/variant')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: ProductVariantCreateDto })
    @ApiResponse({ status: 201, description: 'Variante créée', type: ProductVariantResponseDto })
    async createVariant(
        @Param('id') productId: number,
        @Body() dto: ProductVariantCreateDto,
        @Req() req: any
    ): Promise<ProductVariantResponseDto> {
        this.logger.log(`POST /product/${productId}/variant`, JSON.stringify(dto));
        try {
            if (!req.user || req.user.role !== UserRole.SELLER) {
                this.logger.error('Accès réservé aux vendeurs', { user: req.user });
                throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
            }
            // Vérifier que le produit existe et appartient au vendeur
            const product = await this.productService.findById(Number(productId));
            if (!product) {
                this.logger.error('Produit introuvable');
                throw new HttpException('Produit introuvable', HttpStatus.NOT_FOUND);
            }
            const vendor = await this.vendorService.findByUserId(req.user.id);
            if (!vendor || product.shop?.vendorId !== vendor.id) {
                this.logger.error('Accès interdit : ce produit ne vous appartient pas', { userId: req.user.id, vendorId: vendor?.id, shopVendorId: product.shop?.vendorId });
                throw new HttpException('Accès interdit', HttpStatus.FORBIDDEN);
            }
            const variant = await this.productVariantService.createVariant(Number(productId), dto as any);
            this.logger.log('Variante créée avec succès', JSON.stringify(variant));
            return variant;
        } catch (error) {
            this.logger.error('Erreur lors de la création de la variante', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/product-variant/:id/image')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: ProductImageCreateDto })
    @ApiResponse({ status: 201, description: 'Image ajoutée à la variante' })
    async addImageToVariant(
        @Param('id') variantId: number,
        @Body() dto: ProductImageCreateDto,
        @Req() req: any
    ): Promise<{ message: string }> {
        this.logger.log(`POST /product-variant/${variantId}/image`, JSON.stringify(dto));
        try {
            if (!req.user || req.user.role !== UserRole.SELLER) {
                this.logger.error('Accès réservé aux vendeurs', { user: req.user });
                throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
            }
            // Vérifier que la variante existe et appartient au vendeur
            const variant = await this.productVariantService.findById(Number(variantId));
            if (!variant) {
                this.logger.error('Variante introuvable');
                throw new HttpException('Variante introuvable', HttpStatus.NOT_FOUND);
            }
            const product = await this.productService.findById(variant.productId);
            const vendor = await this.vendorService.findByUserId(req.user.id);
            if (!vendor || product.shop?.vendorId !== vendor.id) {
                this.logger.error('Accès interdit : cette variante ne vous appartient pas', { userId: req.user.id, vendorId: vendor?.id, shopVendorId: product.shop?.vendorId });
                throw new HttpException('Accès interdit', HttpStatus.FORBIDDEN);
            }
            await this.productImageService.addImage(Number(variantId), dto.url);
            this.logger.log('Image ajoutée à la variante avec succès');
            return { message: 'Image ajoutée à la variante' };
        } catch (error) {
            this.logger.error('Erreur lors de l\'ajout de l\'image', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 