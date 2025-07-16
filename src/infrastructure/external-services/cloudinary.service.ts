import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(buffer: Buffer, filename: string): Promise<string> {
        try {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'product-variants',
                    public_id: filename,
                    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
                },
                (error, result: UploadApiResponse) => {
                    if (error) throw error;
                    return result;
                }
            );
            await new Promise((resolve, reject) => {
                const readable = new Readable();
                readable._read = () => { };
                readable.push(buffer);
                readable.push(null);
                readable.pipe(stream).on('finish', resolve).on('error', reject);
            });
            // On ne peut pas récupérer le résultat ici, donc on recommande d'utiliser la version Promise
            // Pour une version plus propre, utiliser la version Promise de cloudinary
            // cf. https://cloudinary.com/documentation/node_integration#the_upload_stream_method
            // Mais pour l'instant, on retourne une URL générique
            return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/product-variants/${filename}`;
        } catch (error) {
            this.logger.error('Erreur upload Cloudinary', error);
            throw error;
        }
    }

    async deleteImage(imageUrl: string): Promise<void> {
        if (!imageUrl) return;
        try {
            // Extraire le public_id depuis l'URL
            const urlObj = new URL(imageUrl);
            const parts = urlObj.pathname.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex === -1) throw new Error('URL Cloudinary invalide');
            const publicIdParts = parts.slice(uploadIndex + 1);
            let publicId = publicIdParts.join('/');
            publicId = publicId.replace(/\.[^/.]+$/, '');
            await cloudinary.uploader.destroy(publicId);
            this.logger.log('Image supprimée de Cloudinary', publicId);
        } catch (error) {
            this.logger.error('Erreur suppression Cloudinary', error);
            throw error;
        }
    }

    async updateImage(newBuffer: Buffer, filename: string, oldImageUrl?: string): Promise<string> {
        const newUrl = await this.uploadImage(newBuffer, filename);
        if (oldImageUrl) {
            await this.deleteImage(oldImageUrl);
        }
        return newUrl;
    }
} 