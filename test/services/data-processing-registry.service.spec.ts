import { Test, TestingModule } from '@nestjs/testing';
import { DataProcessingRegistryService } from '../../src/application/services/data-processing-registry.service';

describe('DataProcessingRegistryService', () => {
    let service: DataProcessingRegistryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DataProcessingRegistryService],
        }).compile();
        service = module.get<DataProcessingRegistryService>(DataProcessingRegistryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 