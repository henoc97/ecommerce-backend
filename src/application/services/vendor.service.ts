import { Injectable, Inject } from '@nestjs/common';
import { VendorPrismaRepository } from '../../infrastructure/impl.repositories/VendorPrisma.repository';

@Injectable()
export class VendorService {
    constructor(
        @Inject(VendorPrismaRepository) private readonly repository: VendorPrismaRepository,
    ) { }

    async createVendor(userId: number) {
        try {
            return await this.repository.createVendor(userId);
        } catch (error) {
            throw error;
        }
    }
    async findByUserId(userId: number) {
        try {
            return await this.repository.findByUserId(userId);
        } catch (error) {
            throw error;
        }
    }
    async listVendors() {
        try {
            return await this.repository.listVendors();
        } catch (error) {
            throw error;
        }
    }
    async getVendorShops(vendorId: number) {
        try {
            return await this.repository.getVendorShops(vendorId);
        } catch (error) {
            throw error;
        }
    }
} 