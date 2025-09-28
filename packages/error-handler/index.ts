export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(
        message:string, 
        statusCode:number, 
        isOperational = true, 
        details?:string
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this);
    }
};

export class NotFoundError extends AppError {
    constructor(message: "Resource not found") {
        super(message, 404);
    }
};

export class ValidationError extends AppError {
    constructor(message = 'invailid request data', details?: any) {
        super(message, 400, true, details);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message: "Unauthorized access", details?: any) {
        super(message, 401, true, details);
    }
};

export class ForbiddenError extends AppError {
    constructor(message: "Forbidden", details?: any) {
        super(message, 403, true, details);
    }
};

export class InternalServerError extends AppError {
    constructor(message: "Internal server error", details?: any) {
        super(message, 500, false, details);
    }
};