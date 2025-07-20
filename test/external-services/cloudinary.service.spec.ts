jest.mock('cloudinary', () => ({
    v2: {
        uploader: {
            upload_stream: jest.fn(),
            destroy: jest.fn(),
        },
        config: jest.fn(),
    },
}));

// Par défaut, le mock pipe() déclenche 'finish' immédiatement
let pipeMock = () => ({
    on: function (event: any, cb: any) {
        if (event === 'finish') setImmediate(cb);
        return this;
    }
});

jest.mock('stream', () => ({
    Readable: class {
        _read() { }
        push() { }
        pipe() { return pipeMock(); }
    }
}));

import { CloudinaryService } from '../../src/infrastructure/external-services/cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

describe('CloudinaryService', () => {
    let service: CloudinaryService;
    const buffer = Buffer.from('test');
    const filename = 'test.png';
    const imageUrl = 'https://res.cloudinary.com/demo/image/upload/product-variants/test.png';

    beforeEach(() => {
        jest.clearAllMocks();
        service = new CloudinaryService();
        // Par défaut, pipeMock simule le succès
        pipeMock = () => ({
            on: function (event, cb) {
                if (event === 'finish') setImmediate(cb);
                return this;
            }
        });
    });

    it('uploadImage retourne une URL', async () => {
        (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((opts, cb) => {
            cb(null, { secure_url: imageUrl });
            return { on: jest.fn().mockReturnThis() };
        });
        const url = await service.uploadImage(buffer, filename);
        expect(url).toContain('cloudinary.com');
    });

    it('uploadImage propage les erreurs', async () => {
        // Patch pipeMock pour simuler une erreur
        pipeMock = () => ({
            on: function (event, cb) {
                if (event === 'error') setImmediate(() => cb(new Error('fail')));
                return this;
            }
        });
        (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((opts, cb) => {
            cb(new Error('fail'));
            return { on: jest.fn().mockReturnThis() };
        });
        await expect(service.uploadImage(buffer, filename)).rejects.toThrow('fail');
    });

    it('deleteImage appelle destroy avec le bon publicId', async () => {
        (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({});
        await service.deleteImage(imageUrl);
        expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('product-variants/test');
    });

    it('deleteImage ne fait rien si imageUrl vide', async () => {
        await service.deleteImage('');
        expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    it('deleteImage propage les erreurs', async () => {
        (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(service.deleteImage(imageUrl)).rejects.toThrow('fail');
    });

    it('updateImage upload puis delete si oldImageUrl', async () => {
        const uploadSpy = jest.spyOn(service, 'uploadImage').mockResolvedValue('newUrl');
        const deleteSpy = jest.spyOn(service, 'deleteImage').mockResolvedValue();
        const url = await service.updateImage(buffer, filename, imageUrl);
        expect(uploadSpy).toHaveBeenCalledWith(buffer, filename);
        expect(deleteSpy).toHaveBeenCalledWith(imageUrl);
        expect(url).toBe('newUrl');
    });

    it('updateImage upload seul si pas oldImageUrl', async () => {
        const uploadSpy = jest.spyOn(service, 'uploadImage').mockResolvedValue('newUrl');
        const deleteSpy = jest.spyOn(service, 'deleteImage').mockResolvedValue();
        const url = await service.updateImage(buffer, filename);
        expect(uploadSpy).toHaveBeenCalledWith(buffer, filename);
        expect(deleteSpy).not.toHaveBeenCalled();
        expect(url).toBe('newUrl');
    });
}); 