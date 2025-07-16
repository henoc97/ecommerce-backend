import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductVariantService } from '../../services/productvariant.service';
import { ProductService } from '../../services/product.service';
import { VendorService } from '../../services/vendor.service';
import { ProductImageService } from '../../services/productimage.service';
import { CloudinaryService } from '../../../infrastructure/external-services/cloudinary.service';

@Injectable()
export class DeleteImageFromVariantUseCase {
    constructor(
        @Inject(ProductVariantService) private readonly productVariantService: ProductVariantService,
        @Inject(ProductService) private readonly productService: ProductService,
        @Inject(VendorService) private readonly vendorService: VendorService,
        @Inject(ProductImageService) private readonly productImageService: ProductImageService,
        @Inject(CloudinaryService) private readonly cloudinaryService: CloudinaryService,
    ) { }

    async execute(variantId: number, imageId: number, user: any): Promise<void> {
        // Vérifier que la variante existe
        const variant = await this.productVariantService.findById(variantId);
        if (!variant) throw new NotFoundException('Variante introuvable');
        // Vérifier que le produit appartient au vendeur
        const product = await this.productService.findById(variant.productId);
        const vendor = await this.vendorService.findByUserId(user.id);
        if (!vendor || product.shop?.vendorId !== vendor.id) {
            throw new ForbiddenException('Accès interdit : cette variante ne vous appartient pas');
        }
        // Récupérer l'image
        const images = await this.productImageService.listImagesByVariant(variantId);
        const image = images.find(img => img.id === imageId);
        if (!image) throw new NotFoundException('Image introuvable');
        // Supprimer de Cloudinary
        await this.cloudinaryService.deleteImage(image.url);
        // Supprimer de la base
        await this.productImageService.deleteImage(imageId);
    }
} 