

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../packages/libs/prisma";

// Extend Express Request interface to include 'user'



const isAuthenticated = async(req: any, res: Response, next: NextFunction) => {
    try {
        // allow client to indicate which role should be active via a cookie `active-role`
        // if present prefer the token for that role, otherwise fall back to current order
        const activeRole = req.cookies['active-role'];
        let token: string | undefined;

        if (activeRole === 'seller') {
            token = req.cookies['seller-access-token'] || req.headers.authorization?.split(" ")[1];
        } else if (activeRole === 'user') {
            token = req.cookies['access-token'] || req.headers.authorization?.split(" ")[1];
        } else {
            token = req.cookies['access-token'] || req.cookies['seller-access-token'] || req.headers.authorization?.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ 
              message: "Unauthorized token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
             id: string; 
             role: "user" | "seller" };

        if (!decoded) {
            return res.status(401).json({ 
                message: "Unauthorized! Invalid token" 
            });
        }

        let account;

        if (decoded.role === "user") {
            account = await prisma.users.findUnique({
            where: {id: decoded.id},
        });
        req.user = account;

        } else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({
            where: {id: decoded.id},
            include: { shop: true }
        });
        req.seller = account;
        }

        if (!account) {
            return res.status(401).json({ 
             message: "Account not found!" });
        }

        req.role = decoded.role;
    
      return next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized token expired or invalid" });
    }
} 
export default isAuthenticated;