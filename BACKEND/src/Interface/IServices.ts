import { Request } from "express";
export interface IService <T, K, updateDTO = Partial<T>>
{
    findAll(offset: number, limit: number, search: string, sortBy: string, order: string): Promise<T[]>;
    findById(id: number): Promise<T>;
    create(data: Omit<T, "id" | "createAt"| "modifiedAt">): Promise<T>;
    update(id: number, data: updateDTO, userId: number, req: Request): Promise<[T,K]>;
    delete(id: number): Promise<void>,
    count():Promise<number>;
}