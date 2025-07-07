import { Injectable, Inject } from '@nestjs/common';
import { SubsitePrismaRepository } from '../../infrastructure/impl.repositories/SubsitePrisma.repository';
import { SubsiteEntity } from '../../domain/entities/Subsite.entity';

@Injectable()
export class SubsiteService {
    constructor(
        @Inject(SubsitePrismaRepository) private readonly repository: SubsitePrismaRepository,
    ) { }

    async createSubsite(data: SubsiteEntity) {
        try {
            return await this.repository.createSubsite(data);
        } catch (error) {
            throw error;
        }
    }
    async updateSubsite(id: number, config: Partial<SubsiteEntity>) {
        try {
            return await this.repository.updateSubsite(id, config);
        } catch (error) {
            throw error;
        }
    }
    async findByShopId(shopId: number) {
        try {
            return await this.repository.findByShopId(shopId);
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
} 