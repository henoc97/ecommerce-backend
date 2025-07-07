import { Injectable, Inject } from '@nestjs/common';
import { ReviewPrismaRepository } from '../../infrastructure/impl.repositories/ReviewPrisma.repository';
import { ReviewEntity } from '../../domain/entities/Review.entity';

@Injectable()
export class ReviewService {
    constructor(
        @Inject(ReviewPrismaRepository) private readonly repository: ReviewPrismaRepository,
    ) { }

    async createReview(data: ReviewEntity) {
        try {
            return await this.repository.createReview(data);
        } catch (error) {
            throw error;
        }
    }
    async updateReview(id: number, data: Partial<ReviewEntity>) {
        try {
            return await this.repository.updateReview(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteReview(id: number) {
        try {
            return await this.repository.deleteReview(id);
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number) {
        try {
            return await this.repository.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async listReviews(filter?: Partial<ReviewEntity>) {
        try {
            return await this.repository.listReviews(filter);
        } catch (error) {
            throw error;
        }
    }
} 