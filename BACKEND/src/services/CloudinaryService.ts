import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export class CloudinaryService {
    static async uploadVoiceMessage(file: Express.Multer.File): Promise<string> {
        try {
            console.log('📤 Upload vers Cloudinary:', file.originalname);

            const result = await cloudinary.uploader.upload(file.path, {
                resource_type: 'auto',
                folder: 'voice-messages',
                public_id: `voice_${Date.now()}`,
            });

            console.log('✅ Upload Cloudinary réussi:', result.secure_url);

            // Supprimer le fichier temporaire après upload
            fs.unlinkSync(file.path);

            return result.secure_url;
        } catch (error) {
            console.error('❌ Erreur upload Cloudinary:', error);
            const err = error as any;
            console.error('Détails erreur Cloudinary:', {
                message: err.message,
                http_code: err.http_code,
                status_code: err.status_code
            });
            throw new Error(`Erreur lors de l'upload vers Cloudinary: ${err.message}`);
        }
    }

    // Méthode uploadImage supprimée car les images sont gérées localement dans le backend

    static async deleteFile(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
            console.log('🗑️ Fichier supprimé de Cloudinary:', publicId);
        } catch (error) {
            console.error('❌ Erreur suppression Cloudinary:', error);
            throw new Error('Erreur lors de la suppression du fichier');
        }
    }

    static async deleteVoiceMessage(url: string): Promise<void> {
        try {
            if (!url || !url.includes('res.cloudinary.com')) {
                console.log('ℹ️ Pas d\'URL Cloudinary valide pour suppression');
                return;
            }

            // Extraire le public_id de l'URL Cloudinary (format: https://res.cloudinary.com/<cloud>/image/upload/<transformations>/v<version>/<public_id>.<extension>)
            const publicIdMatch = url.match(/\/upload\/(?:[^\/]+\/)*([^\/\.]+)(?:\.[^\/\?]+)?(?:\?.*)?$/);
            if (!publicIdMatch) {
                console.error('❌ Impossible d\'extraire publicId de l\'URL:', url);
                return;
            }

            const publicId = publicIdMatch[1];
            if (!publicId) {
                console.error('❌ PublicId non trouvé pour suppression');
                return;
            }
            console.log('🗑️ Suppression voiceMessage avec publicId:', publicId);

            await this.deleteFile(publicId);
            console.log('✅ Ancien voiceMessage supprimé de Cloudinary');
        } catch (error) {
            console.error('❌ Erreur lors de la suppression du voiceMessage:', error);
            // Ne pas throw pour ne pas bloquer l'update si suppression échoue
        }
    }
}
