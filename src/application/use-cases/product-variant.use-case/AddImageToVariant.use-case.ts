import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductVariantService } from '../../services/productvariant.service';
import { ProductService } from '../../services/product.service';
import { VendorService } from '../../services/vendor.service';
import { ProductImageService } from '../../services/productimage.service';
import { CloudinaryService } from '../../../infrastructure/external-services/cloudinary.service';

@Injectable()
export class AddImageToVariantUseCase {
    constructor(
        @Inject(ProductVariantService) private readonly productVariantService: ProductVariantService,
        @Inject(ProductService) private readonly productService: ProductService,
        @Inject(VendorService) private readonly vendorService: VendorService,
        @Inject(ProductImageService) private readonly productImageService: ProductImageService,
        @Inject(CloudinaryService) private readonly cloudinaryService: CloudinaryService,
    ) { }

    async execute(variantId: number, fileBuffer: Buffer, originalname: string, user: any): Promise<{ url: string }> {
        // Vérifier que la variante existe
        const variant = await this.productVariantService.findById(variantId);
        if (!variant) throw new NotFoundException('Variante introuvable');
        // Vérifier que le produit appartient au vendeur
        const product = await this.productService.findById(variant.productId);
        const vendor = await this.vendorService.findByUserId(user.id);
        if (!vendor || product.shop?.vendorId !== vendor.id) {
            throw new ForbiddenException('Accès interdit : cette variante ne vous appartient pas');
        }
        // Upload sur Cloudinary
        const filename = `${variantId}_${Date.now()}_${originalname}`;
        const url = await this.cloudinaryService.uploadImage(fileBuffer, filename);
        // Enregistrer l'URL dans la base
        await this.productImageService.addImage(variantId, url);
        return { url };
    }
} 