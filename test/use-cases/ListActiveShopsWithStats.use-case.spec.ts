import { ListActiveShopsWithStatsUseCase } from '../../src/application/use-cases/shop.use-case/ListActiveShopsWithStats.use-case';
describe('ListActiveShopsWithStatsUseCase', () => {
    let useCase: ListActiveShopsWithStatsUseCase;
    let shopService: any;
    let reviewService: any;

    beforeEach(() => {
        shopService = { listActiveShopsWithProducts: jest.fn() };
        reviewService = { listReviews: jest.fn() };
        useCase = new ListActiveShopsWithStatsUseCase(shopService, reviewService);
    });

    it('doit retourner les shops actifs avec stats', async () => {
        shopService.listActiveShopsWithProducts.mockResolvedValue([{ id: 1, products: [] }]);
        reviewService.listReviews.mockResolvedValue([]);
        const result = await useCase.execute();
        expect(shopService.listActiveShopsWithProducts).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it('doit retourner un tableau vide si aucun shop actif', async () => {
        shopService.listActiveShopsWithProducts.mockResolvedValue([]);
        const result = await useCase.execute();
        expect(result).toEqual([]);
    });

    it('doit propager l\'erreur du service', async () => {
        shopService.listActiveShopsWithProducts.mockRejectedValue(new Error('fail'));
        await expect(useCase.execute()).rejects.toThrow('fail');
    });
}); 