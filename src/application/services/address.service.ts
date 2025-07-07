import { Injectable, Inject } from '@nestjs/common';
import { AddressPrismaRepository } from '../../infrastructure/impl.repositories/AddressPrisma.repository';
import { AddressEntity } from '../../domain/entities/Address.entity';

@Injectable()
export class AddressService {
    constructor(
        @Inject(AddressPrismaRepository) private readonly repository: AddressPrismaRepository,
    ) { }

    async createAddress(data: AddressEntity) {
        try {
            return await this.repository.createAddress(data);
        } catch (error) {
            throw error;
        }
    }
    async updateAddress(userId: number, data: AddressEntity) {
        try {
            return await this.repository.updateAddress(userId, data);
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
    async findAllAddresses(userId: number) {
        try {
            return await this.repository.findAllAddresses(userId);
        } catch (error) {
            throw error;
        }
    }
    async deleteAddress(userId: number) {
        try {
            return await this.repository.deleteAddress(userId);
        } catch (error) {
            throw error;
        }
    }
} 