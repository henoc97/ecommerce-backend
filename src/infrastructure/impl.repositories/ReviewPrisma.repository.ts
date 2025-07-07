import prisma from '../../../prisma/client/prisma.service';
import { ReviewEntity } from '../../domain/entities/Review.entity';
import { IReviewRepository } from '../../domain/repositories/Review.repository';

export class ReviewPrismaRepository implements IReviewRepository {
    async createReview(data: ReviewEntity): Promise<ReviewEntity> {
        try {
            return await prisma.review.create({ data }) as ReviewEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateReview(id: number, data: Partial<ReviewEntity>): Promise<ReviewEntity> {
        try {
            return await prisma.review.update({ where: { id }, data }) as ReviewEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteReview(id: number): Promise<void> {
        try {
            await prisma.review.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<ReviewEntity> {
        try {
            return await prisma.review.findUnique({ where: { id } }) as ReviewEntity;
        } catch (error) {
            throw error;
        }
    }
    async listReviews(filter?: Partial<ReviewEntity>): Promise<ReviewEntity[]> {
        try {
            return await prisma.review.findMany({ where: filter }) as ReviewEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getProductReviews(productId: number): Promise<ReviewEntity[]> {
        try {
            return await prisma.review.findMany({ where: { productVariant: { productId } } }) as ReviewEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getShopReviews(shopId: number): Promise<ReviewEntity[]> {
        try {
            return await prisma.review.findMany({ where: { productVariant: { product: { shopId } } } }) as ReviewEntity[];
        } catch (error) {
            throw error;
        }
    }
    async checkUserProductReview(userId: number, productVariantId: number): Promise<ReviewEntity> {
        try {
            return await prisma.review.findUnique({ where: { userId_productVariantId: { userId, productVariantId } } }) as ReviewEntity;
        } catch (error) {
            throw error;
        }
    }
} 