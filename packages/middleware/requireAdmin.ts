import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorization = req.headers.authorization;
        const token = authorization?.startsWith('Bearer ')
            ? authorization.slice(7)
            : undefined;
        const secret = process.env.ADMIN_ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;

        if (!token || !secret) {
            return res.status(401).json({ message: 'Admin authentication required' });
        }

        const payload = jwt.verify(token, secret) as { role?: string; email?: string };
        if (payload.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        (req as any).role = 'admin';
        return next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired admin token' });
    }
};

export default requireAdmin;