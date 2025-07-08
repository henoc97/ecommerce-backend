import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client/prisma.service';
import { SubsiteEntity } from '../../domain/entities/Subsite.entity';
import { ISubsiteRepository } from '../../domain/repositories/Subsite.repository';

export class SubsitePrismaRepository implements ISubsiteRepository {
    async createSubsite(data: SubsiteEntity): Promise<SubsiteEntity> {
        try {
            return await prisma.subsite.create({ data: data as Prisma.SubsiteCreateInput }) as SubsiteEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateSubsite(id: number, config: Partial<SubsiteEntity>): Promise<SubsiteEntity> {
        try {
            return await prisma.subsite.update({ where: { id }, data: config as Prisma.SubsiteUpdateInput }) as SubsiteEntity;
        } catch (error) {
            throw error;
        }
    }
    async findByShopId(shopId: number): Promise<SubsiteEntity> {
        try {
            return await prisma.subsite.findFirst({ where: { shopId } }) as SubsiteEntity;
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<SubsiteEntity> {
        try {
            return await prisma.subsite.findUnique({ where: { id } }) as SubsiteEntity;
        } catch (error) {
            throw error;
        }
    }
} 