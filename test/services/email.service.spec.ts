import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../../src/application/services/email.service';
import axios from 'axios';
jest.mock('axios');

describe('EmailService', () => {
    let service: EmailService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EmailService],
        }).compile();
        service = module.get<EmailService>(EmailService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('EmailService - Méthodes métiers', () => {
    let service: EmailService;

    beforeEach(() => {
        service = new EmailService();
    });

    it('doit appeler send pour chaque email dans sendBulk', async () => {
        const spy = jest.spyOn(service, 'send').mockResolvedValue(); // on spy + on mock pour éviter vrai appel HTTP
        const emails = ['a@a.com', 'b@b.com'];
        await service.sendBulk(emails, 'sujet', 'contenu', 'type');
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith('a@a.com', 'sujet', 'contenu', 'type');
        expect(spy).toHaveBeenCalledWith('b@b.com', 'sujet', 'contenu', 'type');
    });

    it('doit lever une erreur si axios échoue dans send', async () => {
        (axios.post as jest.Mock).mockRejectedValue({ response: { data: 'fail' }, message: 'fail' });
        await expect(service.send('a@a.com', 's', 'c', 't')).rejects.toThrow('EmailJS error: fail');
    });
});
