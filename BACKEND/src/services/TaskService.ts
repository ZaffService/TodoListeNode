import prisma from "../config/prisma.js";
import type { Taches, HistoriqueModifTache } from "../../node_modules/.prisma/client/index.js";
import type { IService } from "../Interface/IServices.js";
import { HttpStatusCode } from "../enum/StatusCode.js";
import { ErrorsMessagesFr } from "../enum/ErrorsMessagesFr.js";
import { Permission } from "@prisma/client";
import { Request } from "express";

export class TaskService {
    static async findAll(
        offset: number,
        limit: number,
        search: string,
        sortBy: string,
        order: string,
        etat?: "Termine" | "En_Cours" | "En_Attente"
    ): Promise<Taches[]> {
        return await prisma.taches.findMany({
            skip: offset,
            take: limit,
            where: {
                AND: [
                    {
                        OR: [
                            { description: { contains: search } }
                        ]
                    },
                    etat ? { etat } : {}
                ]
            },
            orderBy: {
                [sortBy]: order
            }
        });
    }

    static async count(): Promise<number> {
        return await prisma.taches.count();
    }

    static async countCompletedByUser(userId: number): Promise<number> {
        return await prisma.taches.count({
            where: {

                userId,
                etat: "Termine"
            }
        });
    }

    static async findById(id: number): Promise<Taches> {
        const task = await prisma.taches.findUnique({ where: { id } });
        if (!task) {
            throw { 
                status: HttpStatusCode.NOT_FOUND, 
                message: ErrorsMessagesFr.TACHE_INTROUVABLE 
            };
        }
        return task;
    }

    static async create(data: Omit<Taches, "id" | "createAt" | "modifiedAt">): Promise<Taches> {
        console.log('TaskService - Données reçues:', data);
        const result = await prisma.taches.create({
            data: {
                description: data.description,
                image: data.image,
                voiceMessage: data.voiceMessage,
                startDate: data.startDate,
                endDate: data.endDate,
                etat: data.etat,
                user: { connect: { id: data.userId } }
            }
        });
        console.log('TaskService - Tâche créée:', result);
        return result;
    }

    static async update(
        id: number, 
        data: Partial<Taches>, 
        userId: number, 
        req: Request
    ): Promise<[Taches, HistoriqueModifTache]> {
        const task = await prisma.taches.findUnique({ where: { id } });
        if (!task) {
            throw {
                status: HttpStatusCode.NOT_FOUND,
                message: ErrorsMessagesFr.TACHE_INTROUVABLE
            };
        }

        const [taches, log] = await prisma.$transaction([
            prisma.taches.update({ where: { id }, data }),
            prisma.historiqueModifTache.create({
                data: {
                    action: (req.method).toUpperCase() as Permission,
                    user: { connect: { id: userId } },
                    taches: { connect: { id } }
                }
            })
        ]);

        return [taches, log];
    }

    static async delete(id: number): Promise<void> {
        const task = await prisma.taches.findUnique({ where: { id } });
        if (!task) {
            throw { 
                status: HttpStatusCode.NOT_FOUND, 
                message: ErrorsMessagesFr.TACHE_INTROUVABLE 
            };
        }
        await prisma.taches.delete({ where: { id } });
    }
}

const TypedUserService: IService<Taches, HistoriqueModifTache> = TaskService;