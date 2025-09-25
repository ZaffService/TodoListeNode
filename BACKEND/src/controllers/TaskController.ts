import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/TaskService.js";
import { taskschema } from "../models/TaskModel.js";
import { Etat} from "../../node_modules/.prisma/client/index.js"
import { ReponseFormatter } from "../middlewaares/ReponseFormatter.js";
import { SuccessCodes } from "../enum/SuccesCodesFr.js";
import { JWTService } from "../services/JWTService.js";
import { describe } from "node:test";
import { HistoriqueModifTacheService } from "../services/HistoriqueModifTacheService.js";
import { CloudinaryService } from "../services/CloudinaryService.js";

export class TaskController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
            const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 3;
            const offset = (page - 1) * limit;

            const search = (req.query.search as string) || "";
            const etat = (req.query.etat as "Termine" | "En_Cours" | "En_Attente" | undefined);

            const sortBy = (req.query.sortBy as string) || "description";
            const ordr = (req.query.order as string) === "desc" ? "desc" : "asc";

            const tasks = await TaskService.findAll(offset, limit, search, sortBy, ordr, etat);
            // Pour voiceMessage : URLs Cloudinary déjà complètes
            // Pour image : Si URL Cloudinary (ancienne), garder ; sinon (nom fichier local), ajouter préfixe
            tasks.forEach(task => {
                if (task.image) {
                    if (task.image.startsWith('https://res.cloudinary.com')) {
                        // Ancienne URL Cloudinary, garder telle quelle
                        console.log("Image Cloudinary gardée pour tâche", task.id);
                    } else {
                        // Nom fichier local, construire URL
                        task.image = `${req.protocol}://${req.get('host')}/uploads/${task.image}`;
                    }
                }
            });

            // Log des vues seulement si l'utilisateur est authentifié
            if (req.user?.id) {
                let logViews = tasks.map(async task => await HistoriqueModifTacheService.create({userId: req.user!.id, tacheId: task.id}, req));
            }

            const total = await TaskService.count();
            const totalPage = Math.ceil(total / limit);
            const data = { page, limit, total, totalPage, tasks };
            return ReponseFormatter.success(res, data, SuccessCodes.Task_ALL_FETCHED);
        } catch (err) {
            next(err);
        }
    }

    static async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const task = await TaskService.findById(id);

            // Pour image : Si URL Cloudinary, garder ; sinon, construire locale
            if (task.image) {
                if (!task.image.startsWith('https://res.cloudinary.com')) {
                    task.image = `${req.protocol}://${req.get('host')}/uploads/${task.image}`;
                }
            }

            // Log de la vue seulement si l'utilisateur est authentifié
            if (req.user?.id) {
                await HistoriqueModifTacheService.create({userId: req.user.id, tacheId: task.id}, req);
            }

            return ReponseFormatter.success(res, task, SuccessCodes.Task_FETCHED);
        } catch (err: any) {
            next(err);
        }
    }

   static async create(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = Number(req.user?.id);

        // Validation de l'utilisateur authentifié
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: "Utilisateur non authentifié"
            });
        }

        console.log("=== TASK CONTROLLER CREATE DEBUG ===");
        console.log("Body reçu:", req.body);
        console.log("Files reçus:", req.files);

        // Mapper les noms de champs du frontend (dateDebut/dateFin) vers backend (startDate/endDate)
        const startDate = req.body.dateDebut || req.body.startDate || undefined;
        const endDate = req.body.dateFin || req.body.endDate || undefined;

        // Parse et validation des champs texte avec le schéma
        const parsedBody = taskschema.parse({
            description: req.body.description,
            image: req.body.image || undefined,
            voiceMessage: req.body.voiceMessage || undefined,
            startDate: startDate,
            endDate: endDate
        });

        // Définition d'une interface pour les fichiers
        interface TaskFiles {
            image?: Express.Multer.File[];
            voiceMessage?: Express.Multer.File[];
        }

        const files = req.files as TaskFiles;
        console.log("Champs fichiers reçus:", Object.keys(files || {}));

        // Interface pour les données de la tâche
        interface TaskData {
            description: string;
            image: string | null;
            voiceMessage: string | null;
            startDate: Date | null;
            endDate: Date | null;
            etat: Etat;
        }

        // Initialisation des données
        const data: TaskData = {
            description: parsedBody.description,
            image: null,
            voiceMessage: null,
            startDate: parsedBody.startDate ? new Date(parsedBody.startDate) : null,
            endDate: parsedBody.endDate ? new Date(parsedBody.endDate) : null,
            etat: parsedBody.startDate ? Etat.En_Attente : Etat.En_Cours
        };

        // Vérifier si on a des données base64 dans le body
        let voiceMessageData = req.body.voiceMessage;
        let imageData = req.body.image;

        // Gestion image multer (locale)
        if (files?.image?.[0]) {
            const imageFile = files.image[0];
            console.log("✅ Image multer reçue:", {
                filename: imageFile.filename,
                mimetype: imageFile.mimetype,
                size: imageFile.size,
                originalname: imageFile.originalname
            });

            // Vérification mimetype pour s'assurer que c'est une image
            if (imageFile.mimetype && imageFile.mimetype.startsWith('image/')) {
                try {
                    const fs = await import('fs');
                    const path = await import('path');
                    const dir = path.join(process.cwd(), 'uploads');
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }

                    const filename = `image_${Date.now()}_${imageFile.originalname}`;
                    const filepath = path.join(dir, filename);
                    fs.renameSync(imageFile.path, filepath);

                    data.image = filename;
                    console.log("✅ Image sauvegardée localement:", data.image);
                } catch (error) {
                    console.error("❌ Erreur lors de la sauvegarde de l'image (multer):", error);
                    return res.status(500).json({ success: false, error: "Erreur lors de la sauvegarde de l'image" });
                }
            } else {
                console.error("❌ Fichier image invalide (mimetype: " + imageFile.mimetype + ")");
                return res.status(400).json({ success: false, error: "Fichier image invalide" });
            }
        } else if (imageData && imageData.includes('base64')) {
            try {
                console.log("✅ Traitement base64 pour image");
                const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches) {
                    const mimetype = matches[1];
                    if (mimetype.startsWith('image/')) {
                        const buffer = Buffer.from(matches[2], 'base64');
                        const extension = mimetype.split('/')[1] || 'png';
                        const filename = `image_${Date.now()}.${extension}`;
                        const filepath = `uploads/${filename}`;

                        const fs = await import('fs');
                        const path = await import('path');
                        const dir = path.join(process.cwd(), 'uploads');
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }

                        fs.writeFileSync(filepath, buffer);
                        data.image = filename;
                        console.log("✅ Image base64 sauvegardée localement:", data.image);
                    } else {
                        console.error("❌ Base64 image invalide (mimetype: " + mimetype + ")");
                    }
                }
            } catch (error) {
                console.error("❌ Erreur traitement base64 image:", error);
                return res.status(500).json({ success: false, error: "Erreur traitement image" });
            }
        }

        // Si on a des fichiers uploadés via multer pour voiceMessage
        if (files?.voiceMessage?.[0]) {
            const voiceFile = files.voiceMessage[0];
            console.log("✅ Fichier voiceMessage multer reçu:", {
                filename: voiceFile.filename,
                mimetype: voiceFile.mimetype,
                size: voiceFile.size,
                originalname: voiceFile.originalname
            });

            // Vérification stricte : si c'est une image, la traiter comme image locale
            if (voiceFile.mimetype && voiceFile.mimetype.startsWith('image/')) {
                console.log("⚠️ Fichier voiceMessage est une image (mimetype: " + voiceFile.mimetype + "), traité comme image locale");
                // Traiter comme image locale (même logique que pour files.image)
                try {
                    const fs = await import('fs');
                    const path = await import('path');
                    const dir = path.join(process.cwd(), 'uploads');
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }

                    const filename = `image_${Date.now()}_${voiceFile.originalname}`;
                    const filepath = path.join(dir, filename);
                    fs.renameSync(voiceFile.path, filepath);

                    data.image = filename;
                    console.log("✅ Image (de voice field) sauvegardée localement:", data.image);
                } catch (error) {
                    console.error("❌ Erreur lors de la sauvegarde de l'image (de voice):", error);
                    return res.status(500).json({ success: false, error: "Erreur lors de la sauvegarde de l'image" });
                }
            } else {
                // Upload vers Cloudinary pour vrai voice
                try {
                    data.voiceMessage = await CloudinaryService.uploadVoiceMessage(voiceFile);
                    console.log("✅ Fichier vocal uploadé vers Cloudinary:", data.voiceMessage);
                } catch (error) {
                    console.error("❌ Erreur lors de l'upload du message vocal (multer):", error);
                    const err = error as Error;
                    return res.status(500).json({
                        success: false,
                        error: "Erreur lors de l'upload du message vocal",
                        details: err.message
                    });
                }
            }
        } else if (voiceMessageData && voiceMessageData.includes('base64')) {
            try {
                console.log("✅ Traitement des données base64 pour voiceMessage");
                const matches = voiceMessageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches) {
                    const mimetype = matches[1];
                    console.log("✅ Base64 détecté, type MIME:", mimetype);
                    const buffer = Buffer.from(matches[2], 'base64');

                    // Vérification stricte : si c'est une image, la traiter comme image locale
                    if (mimetype.startsWith('image/')) {
                        console.log("⚠️ Base64 voiceMessage est une image (mimetype: " + mimetype + "), traité comme image locale");
                        const extension = mimetype.split('/')[1] || 'png';
                        const filename = `image_${Date.now()}.${extension}`;
                        const filepath = `uploads/${filename}`;

                        const fs = await import('fs');
                        const path = await import('path');
                        const dir = path.join(process.cwd(), 'uploads');
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }

                        fs.writeFileSync(filepath, buffer);
                        data.image = filename;
                        console.log("✅ Image base64 (de voice) sauvegardée localement:", data.image);
                    } else {
                        // Traiter comme voice : créer fichier temp et upload Cloudinary
                        const filename = `voice_${Date.now()}.webm`;
                        const filepath = `uploads/voice-messages/${filename}`;

                        const fs = await import('fs');
                        const path = await import('path');
                        const dir = path.join(process.cwd(), 'uploads/voice-messages');
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }

                        fs.writeFileSync(filepath, buffer);
                        console.log("✅ Fichier temporaire écrit:", filepath);

                        const multerFile = {
                            path: filepath,
                            originalname: filename,
                            mimetype: mimetype
                        } as Express.Multer.File;

                        data.voiceMessage = await CloudinaryService.uploadVoiceMessage(multerFile);
                        console.log("✅ Fichier base64 uploadé vers Cloudinary:", data.voiceMessage);
                    }
                } else {
                    console.error("❌ Format base64 invalide pour voiceMessage");
                }
            } catch (error) {
                console.error("❌ Erreur lors du traitement base64 du message vocal:", error);
                const err = error as Error;
                return res.status(500).json({
                    success: false,
                    error: "Erreur lors du traitement du message vocal",
                    details: err.message
                });
            }
        }

        // Préparation de la tâche à sauvegarder
        const newTask = {
            userId,
            description: data.description,
            image: data.image,
            voiceMessage: data.voiceMessage,
            startDate: data.startDate,
            endDate: data.endDate,
            etat: data.etat
        };

        // Validation des données requises
        if (!data.description || data.description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "La description est requise"
            });
        }

        console.log("Données à sauvegarder:", newTask);

        // Création dans la base
        const createdTask = await TaskService.create(newTask);

       
        console.log("Tâche créée avec succès:", createdTask);
        return ReponseFormatter.success(res, createdTask, SuccessCodes.Task_CREATED);
    } catch (err) {
        console.error("Erreur création tâche:", err);
        next(err);
    }
}


    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.id);

            if (!req.user?.id) {
                return res.status(401).json({
                    success: false,
                    error: "Utilisateur non authentifié"
                });
            }

            console.log("=== TASK CONTROLLER UPDATE DEBUG ===");
            console.log("Body reçu:", req.body);
            console.log("Files reçus:", req.files);

            // Récupérer la tâche existante pour suppression anciens fichiers
            const existingTask = await TaskService.findById(id);
            console.log("Tâche existante:", { id, image: existingTask.image, voiceMessage: existingTask.voiceMessage });

            // Mapper les noms de champs du frontend (dateDebut/dateFin) vers backend (startDate/endDate)
            const startDate = req.body.dateDebut || req.body.startDate || undefined;
            const endDate = req.body.dateFin || req.body.endDate || undefined;

            // Parse et validation des champs texte
            const parsedBody = taskschema.partial().parse({
                description: req.body.description,
                image: req.body.image || undefined,
                voiceMessage: req.body.voiceMessage || undefined,
                startDate: startDate,
                endDate: endDate
            });

            // Interface pour les fichiers
            interface TaskFiles {
                image?: Express.Multer.File[];
                voiceMessage?: Express.Multer.File[];
            }

            const files = req.files as TaskFiles;
            console.log("Champs fichiers reçus:", Object.keys(files || {}));

            // Données à updater
            const updateData: any = {
                description: parsedBody.description || existingTask.description,
                startDate: parsedBody.startDate ? new Date(parsedBody.startDate) : existingTask.startDate,
                endDate: parsedBody.endDate ? new Date(parsedBody.endDate) : existingTask.endDate,
                image: existingTask.image,
                voiceMessage: existingTask.voiceMessage
            };

            let imageData = req.body.image;
            let voiceMessageData = req.body.voiceMessage;

            // Gestion nouvelle image (locale)
            if (files?.image?.[0]) {
                const imageFile = files.image[0];
                console.log("✅ Nouvelle image multer reçue:", {
                    mimetype: imageFile.mimetype,
                    originalname: imageFile.originalname
                });

                // Supprimer ancienne image locale si existante et pas Cloudinary
                if (existingTask.image && !existingTask.image.startsWith('https://res.cloudinary.com')) {
                    try {
                        const fs = await import('fs');
                        const path = await import('path');
                        const oldPath = path.join(process.cwd(), 'uploads', existingTask.image);
                        if (fs.existsSync(oldPath)) {
                            fs.unlinkSync(oldPath);
                            console.log("🗑️ Ancienne image locale supprimée:", existingTask.image);
                        }
                    } catch (error) {
                        console.error("❌ Erreur suppression ancienne image:", error);
                    }
                }

                // Sauvegarder nouvelle
                try {
                    const fs = await import('fs');
                    const path = await import('path');
                    const dir = path.join(process.cwd(), 'uploads');
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }

                    const filename = `image_${Date.now()}_${imageFile.originalname}`;
                    const filepath = path.join(dir, filename);
                    fs.renameSync(imageFile.path, filepath);

                    updateData.image = filename;
                    console.log("✅ Nouvelle image sauvegardée localement:", updateData.image);
                } catch (error) {
                    console.error("❌ Erreur sauvegarde nouvelle image:", error);
                    return res.status(500).json({ success: false, error: "Erreur lors de la sauvegarde de l'image" });
                }
            } else if (imageData && imageData.includes('base64')) {
                try {
                    console.log("✅ Traitement base64 pour nouvelle image");
                    const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches) {
                        const mimetype = matches[1];
                        if (mimetype.startsWith('image/')) {
                            const buffer = Buffer.from(matches[2], 'base64');
                            const extension = mimetype.split('/')[1] || 'png';
                            const filename = `image_${Date.now()}.${extension}`;
                            const filepath = `uploads/${filename}`;

                            const fs = await import('fs');
                            const path = await import('path');
                            const dir = path.join(process.cwd(), 'uploads');
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir, { recursive: true });
                            }

                            fs.writeFileSync(filepath, buffer);
                            updateData.image = filename;
                            console.log("✅ Nouvelle image base64 sauvegardée:", updateData.image);

                            // Supprimer ancienne si locale
                            if (existingTask.image && !existingTask.image.startsWith('https://res.cloudinary.com')) {
                                const oldPath = path.join(process.cwd(), 'uploads', existingTask.image);
                                if (fs.existsSync(oldPath)) {
                                    fs.unlinkSync(oldPath);
                                    console.log("🗑️ Ancienne image locale supprimée:", existingTask.image);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error("❌ Erreur traitement base64 image:", error);
                    return res.status(500).json({ success: false, error: "Erreur traitement image" });
                }
            }

            // Gestion nouveau voiceMessage (Cloudinary)
            if (files?.voiceMessage?.[0]) {
                const voiceFile = files.voiceMessage[0];
                console.log("✅ Nouveau voiceMessage multer reçu:", {
                    mimetype: voiceFile.mimetype,
                    originalname: voiceFile.originalname
                });

                // Vérif mimetype : si image, traiter comme image
                if (voiceFile.mimetype && voiceFile.mimetype.startsWith('image/')) {
                    console.log("⚠️ Nouveau voiceMessage est image, traité comme image locale");

                    // Supprimer ancienne image locale si existante
                    if (existingTask.image && !existingTask.image.startsWith('https://res.cloudinary.com')) {
                        try {
                            const fs = await import('fs');
                            const path = await import('path');
                            const oldPath = path.join(process.cwd(), 'uploads', existingTask.image);
                            if (fs.existsSync(oldPath)) {
                                fs.unlinkSync(oldPath);
                                console.log("🗑️ Ancienne image locale supprimée:", existingTask.image);
                            }
                        } catch (error) {
                            console.error("❌ Erreur suppression ancienne image:", error);
                        }
                    }

                    // Sauvegarder nouvelle comme image
                    try {
                        const fs = await import('fs');
                        const path = await import('path');
                        const dir = path.join(process.cwd(), 'uploads');
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }

                        const filename = `image_${Date.now()}_${voiceFile.originalname}`;
                        const filepath = path.join(dir, filename);
                        fs.renameSync(voiceFile.path, filepath);

                        updateData.image = filename;
                        console.log("✅ Image (de voice) sauvegardée localement:", updateData.image);
                    } catch (error) {
                        console.error("❌ Erreur sauvegarde image de voice:", error);
                        return res.status(500).json({ success: false, error: "Erreur sauvegarde image" });
                    }
                } else {
                    // Supprimer ancien voice si existant
                    if (existingTask.voiceMessage) {
                        await CloudinaryService.deleteVoiceMessage(existingTask.voiceMessage);
                    }

                    // Upload nouveau
                    try {
                        updateData.voiceMessage = await CloudinaryService.uploadVoiceMessage(voiceFile);
                        console.log("✅ Nouveau voiceMessage uploadé Cloudinary:", updateData.voiceMessage);
                    } catch (error) {
                        console.error("❌ Erreur upload voice:", error);
                        return res.status(500).json({ success: false, error: "Erreur upload voiceMessage" });
                    }
                }
            } else if (voiceMessageData && voiceMessageData.includes('base64')) {
                try {
                    console.log("✅ Traitement base64 pour nouveau voiceMessage");
                    const matches = voiceMessageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches) {
                        const mimetype = matches[1];
                        const buffer = Buffer.from(matches[2], 'base64');

                        if (mimetype.startsWith('image/')) {
                            console.log("⚠️ Base64 voice est image, traité comme image");

                            // Supprimer ancienne image locale si existante
                            if (existingTask.image && !existingTask.image.startsWith('https://res.cloudinary.com')) {
                                try {
                                    const fs = await import('fs');
                                    const path = await import('path');
                                    const oldPath = path.join(process.cwd(), 'uploads', existingTask.image);
                                    if (fs.existsSync(oldPath)) {
                                        fs.unlinkSync(oldPath);
                                        console.log("🗑️ Ancienne image locale supprimée:", existingTask.image);
                                    }
                                } catch (error) {
                                    console.error("❌ Erreur suppression ancienne image:", error);
                                }
                            }

                            // Sauvegarder nouvelle comme image
                            const extension = mimetype.split('/')[1] || 'png';
                            const filename = `image_${Date.now()}.${extension}`;
                            const filepath = `uploads/${filename}`;

                            const fs = await import('fs');
                            const path = await import('path');
                            const dir = path.join(process.cwd(), 'uploads');
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir, { recursive: true });
                            }

                            fs.writeFileSync(filepath, buffer);

                            updateData.image = filename;
                            console.log("✅ Image base64 (de voice) sauvegardée:", updateData.image);
                        } else {
                            // Supprimer ancien voice
                            if (existingTask.voiceMessage) {
                                await CloudinaryService.deleteVoiceMessage(existingTask.voiceMessage);
                            }

                            // Créer temp et upload
                            const filename = `voice_${Date.now()}.webm`;
                            const filepath = `uploads/voice-messages/${filename}`;

                            const fs = await import('fs');
                            const path = await import('path');
                            const dir = path.join(process.cwd(), 'uploads/voice-messages');
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir, { recursive: true });
                            }

                            fs.writeFileSync(filepath, buffer);

                            const multerFile = {
                                path: filepath,
                                originalname: filename,
                                mimetype: mimetype
                            } as Express.Multer.File;

                            updateData.voiceMessage = await CloudinaryService.uploadVoiceMessage(multerFile);
                            console.log("✅ Nouveau voice base64 uploadé Cloudinary:", updateData.voiceMessage);
                        }
                    }
                } catch (error) {
                    console.error("❌ Erreur traitement base64 voice:", error);
                    return res.status(500).json({ success: false, error: "Erreur traitement voiceMessage" });
                }
            }

            // Validation description si fournie
            if (updateData.description && updateData.description.trim().length === 0) {
                return res.status(400).json({ success: false, error: "Description ne peut pas être vide" });
            }

            console.log("Données à updater:", updateData);

            // Update en DB
            const modifiedTask = await TaskService.update(id, updateData, userId, req);

            console.log("Tâche mise à jour:", modifiedTask);
            return ReponseFormatter.success(res, modifiedTask, SuccessCodes.Task_UPDATED);
        } catch (err) {
            console.error("Erreur update tâche:", err);
            next(err);
        }
    }

    static async updateStatusDone(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = { etat: Etat.Termine };
            const updatedTaskStatus = await TaskService.update(id, data, req.user?.id, req);
            return ReponseFormatter.success(res, updatedTaskStatus, SuccessCodes.Task_MARKED_DONE);
        } catch (err) {
            next(err);
        }
    }

    static async updateStatusUndone(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = { etat: Etat.En_Cours };
            const updatedTaskStatus = await TaskService.update(id, data, req.user?.id, req);
            return ReponseFormatter.success(res, updatedTaskStatus, SuccessCodes.Task_MARKED_UNDONE);
        } catch (err) {
            next(err);
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            await TaskService.delete(id);
            return ReponseFormatter.success(res, null, SuccessCodes.Task_DELETED);
        } catch (err) {
            next(err);
        }
    }

    static async countCompleted(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).json({ success: false, error: "Utilisateur non authentifié" });
            }
            const count = await TaskService.countCompletedByUser(userId);
            return ReponseFormatter.success(res, { count }, SuccessCodes.Task_COUNT_COMPLETED);
        } catch (err) {
            next(err);
        }
    }
}
