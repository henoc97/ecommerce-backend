import { Controller, Post, Body, Param, HttpException, HttpStatus, Logger, UseGuards, Req, Inject, UseInterceptors, UploadedFile, Delete, ParseIntPipe, UploadedFiles } from '@nestjs/common';
import { ProductVariantService } from '../../application/services/productvariant.service';
import { ProductImageService } from '../../application/services/productimage.service';
import { ProductService } from '../../application/services/product.service';
import { VendorService } from '../../application/services/vendor.service';
import { ProductVariantCreateDto, ProductVariantResponseDto, ProductImageCreateDto } from '../dtos/Product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AddImageToVariantUseCase } from '../../application/use-cases/product-variant.use-case/AddImageToVariant.use-case';
import { DeleteImageFromVariantUseCase } from '../../application/use-cases/product-variant.use-case/DeleteImageFromVariant.use-case';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../application/helper/roles.decorator';
import { RolesGuard } from '../../application/helper/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';


@ApiTags('Variantes Produit')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SELLER, UserRole.ADMIN)
@Controller('product-variants')
export class ProductVariantController {
    private readonly logger = new Logger(ProductVariantController.name);

    constructor(
        @Inject(ProductVariantService) private readonly productVariantService: ProductVariantService,
        @Inject(ProductImageService) private readonly productImageService: ProductImageService,
        @Inject(ProductService) private readonly productService: ProductService,
        @Inject(VendorService) private readonly vendorService: VendorService,
        @Inject(AddImageToVariantUseCase) private readonly addImageToVariantUseCase: AddImageToVariantUseCase,
        @Inject(DeleteImageFromVariantUseCase) private readonly deleteImageFromVariantUseCase: DeleteImageFromVariantUseCase,
    ) { }

    @Post('/:productId/variant')
    @ApiBody({ type: ProductVariantCreateDto })
    @ApiResponse({ status: 201, description: 'Variante créée', type: ProductVariantResponseDto })
    @ApiOperation({ summary: 'Créer une nouvelle variante pour un produit', description: 'Cette route permet de créer une nouvelle variante pour un produit existant. Seuls les vendeurs peuvent accéder.' })
    async createVariant(
        @Param('productId') productId: number,
        @Body() dto: ProductVariantCreateDto,
        @Req() req: any
    ): Promise<ProductVariantResponseDto> {
        this.logger.log(`POST /product-variants/${productId}/variant`, JSON.stringify(dto));
        try {
            // Vérification du rôle supprimée (gérée par le guard)
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

    @Post('/:id/images')
    @UseInterceptors(FilesInterceptor('files'))
    @ApiParam({ name: 'id', type: Number })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary'
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'Images ajoutées à la variante' })
    @ApiOperation({ summary: 'Ajouter plusieurs images à une variante', description: 'Upload direct via Cloudinary. Seuls les vendeurs peuvent accéder.' })
    async addImagesToVariant(
        @Param('id', ParseIntPipe) variantId: number,
        @UploadedFiles() files: Array<any>,
        @Req() req: any
    ): Promise<{ message: string; urls: string[] }> {
        this.logger.log(`POST /product-variants/${variantId}/images`, { filesCount: files?.length });
        if (!files || files.length === 0) throw new HttpException('Aucun fichier fourni', HttpStatus.BAD_REQUEST);
        const urls: string[] = [];
        for (const file of files) {
            try {
                const result = await this.addImageToVariantUseCase.execute(variantId, file.buffer, file.originalname, req.user);
                urls.push(result.url);
                this.logger.log(`Image uploadée: ${result.url}`);
            } catch (error) {
                this.logger.error('Erreur upload image', { file: file.originalname, error: error.message });
                // On continue pour les autres fichiers
            }
        }
        return { message: 'Images ajoutées à la variante', urls };
    }

    @Delete('/:variantId/images')
    @ApiParam({ name: 'variantId', type: Number })
    @ApiBody({ description: 'IDs des images à supprimer', schema: { type: 'object', properties: { imageIds: { type: 'array', items: { type: 'number' } } } } })
    @ApiResponse({ status: 200, description: 'Images supprimées de la variante' })
    @ApiOperation({ summary: 'Supprimer plusieurs images d\'une variante', description: 'Supprime plusieurs images de Cloudinary et de la base. Seuls les vendeurs peuvent accéder.' })
    async deleteImagesFromVariant(
        @Param('variantId', ParseIntPipe) variantId: number,
        @Body('imageIds') imageIds: number[],
        @Req() req: any
    ): Promise<{ message: string; deleted: number[]; errors: { id: number; error: string }[] }> {
        this.logger.log(`DELETE /product-variants/${variantId}/images`, { imageIds });
        const deleted: number[] = [];
        const errors: { id: number; error: string }[] = [];
        for (const imageId of imageIds) {
            try {
                await this.deleteImageFromVariantUseCase.execute(variantId, imageId, req.user);
                deleted.push(imageId);
                this.logger.log(`Image supprimée: ${imageId}`);
            } catch (error) {
                this.logger.error('Erreur suppression image', { imageId, error: error.message });
                errors.push({ id: imageId, error: error.message });
            }
        }
        return { message: 'Suppression terminée', deleted, errors };
    }
} 