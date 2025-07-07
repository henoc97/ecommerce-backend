import { ReviewEntity } from "../entities/Review.entity";

export interface IReviewRepository {
    createReview(data: ReviewEntity): Promise<ReviewEntity>;
    updateReview(id: number, data: Partial<ReviewEntity>): Promise<ReviewEntity>;
    deleteReview(id: number): Promise<void>;
    findById(id: number): Promise<ReviewEntity>;
    listReviews(filter?: Partial<ReviewEntity>): Promise<ReviewEntity[]>;
    getProductReviews(productId: number): Promise<ReviewEntity[]>;
    getShopReviews(shopId: number): Promise<ReviewEntity[]>;
    checkUserProductReview(userId: number, productVariantId: number): Promise<ReviewEntity>;
} 