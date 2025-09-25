import { Response } from "express";
import { HttpStatusCode } from "../enum/StatusCode.js";

export class ReponseFormatter
{
    static success(res: Response, data: any, message: string, status: number = HttpStatusCode.OK){
        return res.status(status).json({
            succes: true,
            message,
            data
        })
    }
}