import { NextFunction, Response } from "express";
import { AppError } from "../../packages/error-handler/index.js";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
	if (req.role !== "seller") {
		return next(new AppError("Access denied, sellers only!", 403));
	}
	next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
	if (req.role !== "user") {
		return next(new AppError("Access denied, users only!", 403));
	}
	next();
};
  