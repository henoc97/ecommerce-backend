import { Injectable, Inject } from '@nestjs/common';
import { UserActivityPrismaRepository } from '../../infrastructure/impl.repositories/UserActivityPrisma.repository';
import { UserActivityEntity } from '../../domain/entities/UserActivity.entity';

@Injectable()
export class UserActivityService {
    constructor(
        @Inject(UserActivityPrismaRepository) private readonly repository: UserActivityPrismaRepository,
    ) { }

    async logActivity(data: UserActivityEntity) {
        try {

            return await this.repository.logActivity(data);
        } catch (error) {
            throw error;
        }
    }
    async listActivities(filter?: Partial<UserActivityEntity>) {
        try {
            return await this.repository.listActivities(filter);
        } catch (error) {
            throw error;
        }
    }
    async getShopActivities(shopId: number) {
        try {
            return await this.repository.getShopActivities(shopId);
        } catch (error) {
            throw error;
        }
    }

    // GDPR - Recherche et suppression par utilisateur
    async findByUserId(userId: number) {
        try {
            return await this.repository.findByUserId(userId);
        } catch (error) {
            throw error;
        }
    }

    async deleteByUserId(userId: number) {
        try {
            return await this.repository.deleteByUserId(userId);
        } catch (error) {
            throw error;
        }
    }
} 