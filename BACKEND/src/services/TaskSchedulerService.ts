import * as cron from 'node-cron';
import prisma from '../config/prisma.js';
import { Etat } from '@prisma/client';

export class TaskSchedulerService {
    static startScheduler() {
        // Vérifier toutes les minutes si des tâches doivent changer de statut
        cron.schedule('* * * * *', async () => {
            await this.updateTaskStatuses();
        });

        console.log('✅ Planificateur de tâches démarré');
    }

    static async updateTaskStatuses() {
        const now = new Date();

        try {
            // Tâches en attente dont la date de début est arrivée -> En_Cours
            const tasksToStart = await prisma.taches.findMany({
                where: {
                    etat: Etat.En_Attente,
                    startDate: {
                        lte: now
                    }
                }
            });

            if (tasksToStart.length > 0) {
                await prisma.taches.updateMany({
                    where: {
                        id: { in: tasksToStart.map(t => t.id) }
                    },
                    data: {
                        etat: Etat.En_Cours
                    }
                });
                console.log(`✅ ${tasksToStart.length} tâche(s) passée(s) en cours`);
            }

            // Tâches en cours dont la date de fin est arrivée -> Termine
            const tasksToComplete = await prisma.taches.findMany({
                where: {
                    etat: Etat.En_Cours,
                    endDate: {
                        lte: now
                    }
                }
            });

            if (tasksToComplete.length > 0) {
                await prisma.taches.updateMany({
                    where: {
                        id: { in: tasksToComplete.map(t => t.id) }
                    },
                    data: {
                        etat: Etat.Termine
                    }
                });
                console.log(`✅ ${tasksToComplete.length} tâche(s) terminée(s) automatiquement`);
            }

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour des statuts de tâches:', error);
        }
    }
}
