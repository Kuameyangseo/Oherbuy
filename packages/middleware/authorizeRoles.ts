import { NextFunction, Response } from "express";
import {AppError} from "../../packages/error-handler"

export const isSeller = (req: any, res:Response, next: NextFunction) => {
    if (req.role == "seller"){
        return next(new AppError("Access denied, sellers only!", 403));
    }
};

export const isUser = (req: any, res:Response, next: NextFunction) => {
    if(req.role == "user") {
        return next(new AppError("Access denied: seller only", 403));
    }
};

