import prisma from "../config/prisma.js";
import type {HistoriqueModifTache} from "../../node_modules/.prisma/client/index.js"
import type { IService } from "../Interface/IServices.js";
import { HttpStatusCode } from "../enum/StatusCode.js";
import { ErrorsMessagesFr } from "../enum/ErrorsMessagesFr.js";
import { Request } from "express";
import { Permission } from "@prisma/client";

export class HistoriqueModifTacheService
{
    static async create(data: Omit<HistoriqueModifTache, "id" | "modifiedAt" | "action">, req: Request): Promise<HistoriqueModifTache> {
        // Validation des données requises
        if (!data.userId) {
            throw { status: HttpStatusCode.BAD_REQUEST, message: "ID utilisateur requis" };
        }
        if (!data.tacheId) {
            throw { status: HttpStatusCode.BAD_REQUEST, message: "ID tâche requis" };
        }

        return await prisma.historiqueModifTache.create({data:{
            action: (req.method).toUpperCase() as Permission,
            user: { connect: { id: data.userId } } ,
            taches: { connect: { id: data.tacheId } }
        }})
    }

    static async findModificationByTacheId(id: number) {
        const task = await prisma.historiqueModifTache.findMany({
            where: { tacheId: id },
            select:{modifiedAt: true, action: true, taches: {select:{createAt: true}}, user: {select:{nom: true}}},
            // include: {taches: {select:{createAt: true}}, user: {select:{nom: true}}},
        });
        if (!task) throw {status: HttpStatusCode.NOT_FOUND, message: ErrorsMessagesFr.TACHE_INTROUVABLE}
        return task;
    }
}
