import { Injectable, Inject } from '@nestjs/common';
import { ShopService } from '../../services/shop.service';
import { ReviewService } from '../../services/review.service';
import { ProductService } from '../../services/product.service';

@Injectable()
export class ListActiveShopsWithStatsUseCase {
    constructor(
        @Inject(ShopService) private readonly shopService: ShopService,
        @Inject(ReviewService) private readonly reviewService: ReviewService,
    ) { }

    async execute() {
        // 1. Récupérer les shops actifs avec leurs produits
        const shops = await this.shopService.listActiveShopsWithProducts();
        // 2. Pour chaque shop, calculer la moyenne des ratings et le nombre de produits notés
        const enrichedShops = await Promise.all(shops.map(async (shop: any) => {
            // Récupérer tous les produits du shop
            const products = shop.products || [];
            // Récupérer tous les reviews des produits du shop
            let totalRating = 0;
            let ratedProducts = 0;
            for (const product of products) {
                for (const variant of product.variants || []) {
                    const reviews = await this.reviewService.listReviews({ productVariantId: variant.id });
                    if (reviews && reviews.length > 0) {
                        ratedProducts++;
                        totalRating += reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
                    }
                }
            }
            const moyRating = ratedProducts > 0 ? totalRating / ratedProducts : null;
            return {
                ...shop,
                moyRating,
                nbrsProdRated: ratedProducts
            };
        }));
        // Trie décroissant par moyRating puis nbrsProdRated
        enrichedShops.sort((a, b) => {
            if (b.moyRating !== a.moyRating) {
                return (b.moyRating ?? 0) - (a.moyRating ?? 0);
            }
            return (b.nbrsProdRated ?? 0) - (a.nbrsProdRated ?? 0);
        });
        return enrichedShops;
    }
} 