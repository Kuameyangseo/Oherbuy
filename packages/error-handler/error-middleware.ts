import { AppError } from "./index"
import { NextFunction, Request,Response } from "express";

function isNetworkOrDbError(err: any) {
  if (!err) return false;
  const code = err.code || '';
  const msg = String(err.message || err || '');
  if (code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === 'ENOTFOUND') return true;
  if (msg.includes('Server selection timeout') || msg.includes('connect ETIMEDOUT')) return true;
  // Node may throw AggregateError for multiple connect attempts
  if (typeof AggregateError !== 'undefined' && err instanceof AggregateError) return true;
  return false;
}

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
   if(err instanceof AppError){
     console.log(`Error ${req.method} ${req.url} - ${err.message}`);

    return res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
        ...(err.details && { details: err.details }),
    });
   }

   // Surface network / DB connectivity issues as 503 Service Unavailable
   if (isNetworkOrDbError(err)) {
     console.error(`Connectivity error ${req.method} ${req.url}:`, err);
     return res.status(503).json({
       error: 'Service temporarily unavailable: database or network connectivity issue'
     });
   }

    console.log("Unhandled error", err);

    return res.status(500).json({
    error: "something went wrong, please try again"
  });
};
