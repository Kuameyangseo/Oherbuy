import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";
import { checkOtpRestrictions, handlerForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp, verifyUserForgotPasswordOtp } from "../utils/auth.helper";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";



//Register new user
export const userRegistration = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    try{
        validateRegistrationData(req.body, "user");
        const {name,email} = req.body;

    const existingUser = await prisma.users.findUnique({where: { email }});

    if (existingUser){
        return next(new ValidationError("Email already in use"));
    };

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
        message: "OTP sent to email. Please verify your account.",
    });
    } catch(error){
       return next(error);
    }

};

//Verifyuser
export const verifyUser = async(
    req: Request, 
    res: Response,
    next:NextFunction
) => {
    try {
        const {email, otp, password, name, phone_number, country} = req.body;
        if(!email || !otp || !password || !name || !phone_number || !country ){
          return next(new ValidationError("All fields are required"));
        }

        const existingUser = await prisma.users.findUnique({where: { email }});

        if (existingUser){
            return next(new ValidationError("User already exits with this email"));
        }

        await verifyOtp(email, otp, next);
        const hashedPassword = await bcrypt.hash(password,  10); 

        await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone_number,
                country,
            }
        });

        res.status(201).json({
            success: true,
            message: "User registration successful",
        });

    } catch (error) {
        return next(error);
    }
}
//Login user
export const loginUser = async(
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return next(new ValidationError("All fields are required"));
        }

        const user = await prisma.users.findUnique({where: { email }});

        if (!user){
            return next(new ValidationError("User does not exist with this email"));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid){
            return next(new ValidationError("Invalid credentials"));
        }

        const accessToken = jwt.sign(
            {id: user.id, role: "user"},
            process.env.ACCESS_TOKEN_SECRET as string,
            {
              expiresIn: "15m"
            }
        );

        const refreshToken = jwt.sign(
            {id: user.id, role: "user"},
            process.env.REFRESH_TOKEN_SECRET as string,
            {
              expiresIn: "7d",
            }
        );
        setCookie(res, "access_token", accessToken);
        setCookie(res, "refresh_token", refreshToken);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        return next(error);
    }
}

//Refresh Token
export const refreshToken = async(req:Request, res:Response, next:NextFunction) => {
    try{
        const refreshToken = 
        req.cookies['refresh_token'] ||
        req.cookies['seller-refresh_token'] ||
        req.headers.authorization?.split(" ")[1];

        if (!refreshToken) {
            return next(new ValidationError("Refresh token not provided"));
        }

        const decoded = jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_SECRET as string
        ) as {id: string, role: string};

        if (!decoded || !decoded.id ||decoded.role !== "user") {
            return next(new ValidationError("Invalid token role"));
        }

        let account;
        if (decoded.role === "user") {
            account = await prisma.users.findUnique({where: {id: decoded.id}});
        }else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({
            where: {id: decoded.id},
            include: { shop: true }
         });
        }
            
        if (!account) {
            return next(new ValidationError("User not found"));
        }

            const newAccessToken = jwt.sign(
                {id: account.id, role: "user"},
                process.env.ACCESS_TOKEN_SECRET as string,
                {expiresIn: "15m"}
            );

            if (decoded.role === "user") {
                setCookie(res, "access_token", newAccessToken);
            } else if (decoded.role === "seller") {
                setCookie(res, "seller-access_token", newAccessToken);
            }
            return res.status(200).json({message: "Token refreshed successfully"});
        } catch(error){
            return next(error);
        }
};


export const getUser = async(req:any, res:Response, next:NextFunction) => {
    try{
        const user = req.user;
        res.status(201).json({
         succes: true,
         user,
        });
    }catch(error){
        return next(error);
    }
};
//Forgot Password
export const userForgotPassword = async(
    req:Request,
    res:Response,
    next:NextFunction
) => {
    await handlerForgotPassword(req, res, next, "user")
};

export const verifyUserForgotPassword = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    await verifyUserForgotPasswordOtp(req, res, next);
}

export const resetUserPassword = async(
    req:Request,
    res:Response,
    next:NextFunction
) => {
    try{
        const {email, newPassword} = req.body;

        if (!email || !newPassword)
            return next (new ValidationError("Email and new password are required"));

        const user = await prisma.users.findUnique({where: {email}});
        if (!user) return next(new ValidationError("User not found!"));

        const isSamePassword = await bcrypt.compare(newPassword, user.password!);
        if (isSamePassword){
            return next(new ValidationError(
                "New password cannot be the same as the old password!"
            ));
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.users.update({where: {email}, data:{password: hashedPassword}});

        res.status(200).json({message: "Password reset successfully"});
    } catch(error){
        next(error);
    }
}


// Register new seller
export const registerSeller = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    try{
        validateRegistrationData(req.body, "user");
        const {name,email} = req.body;

    const existingSeller = await prisma.sellers.findUnique({where: { email }});

    if (existingSeller){
        return next(new ValidationError("Seller already exits with this email"));
    };

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "Seller-activation-mail");

    res.status(200).json({
        message: "OTP sent to email. Please verify your account.",
    });
    } catch(error){
       return next(error);
    }

};

//VerifySeller OTP

export const verifySeller = async(
    req: Request, 
    res: Response,
    next:NextFunction
) => {
    try {
        const {email,otp,password,name,phone_number,country} = req.body;
        if(!email || !otp || !password || !name || !phone_number || !country ){
          return next(new ValidationError("All fields are required"));
        }

        const existingSeller = await prisma.sellers.findUnique({where: { email }});

        if (existingSeller){
            return next(new ValidationError("Seller already exits with this email"));
        }

        await verifyOtp(email, otp, next);
        const hashedPassword = await bcrypt.hash(password,  10); 

        const seller = await prisma.sellers.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone_number,
                country,
                stripeId: "", // Provide a valid stripeId or generate one as needed
            }
        });

        res.status(201).json({
            success: true,
            message: "Seller registration successful",
            seller
        });

    } catch (error) {
        return next(error);
    }
}

//Create Shop for seller
export const createSellerShop = async(
    req: Request, 
    res: Response,
    next:NextFunction
) => {
    try {
        const {name, bio, address, sellerId, opening_hours, website, category} = req.body;
        if(!name || !bio || !address || !sellerId || !opening_hours || !website || !category ){
          return next(new ValidationError("All fields are required"));
        }

        const shopData:any = {
            name,
            bio,
            address,
            sellerId,
            opening_hours,
            website,
            category,
        };

        if(website && website.trim() !== ""){
            shopData.website = website;
        }

        const shop = await prisma.shops.create({data: shopData});
        res.status(201).json({
            success: true,
            message: "Shop created successfully",
            shop
        });
    } catch (error) {
        return next(error);
    }
} 



export const loginSeller = async(
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return next(new ValidationError("All fields are required"));
        }

        const user = await prisma.users.findUnique({where: { email }});

        if (!user){
            return next(new ValidationError("User does not exist with this email"));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid){
            return next(new ValidationError("Invalid credentials"));
        }

        const accessToken = jwt.sign(
            {id: user.id, role: "user"},
            process.env.ACCESS_TOKEN_SECRET as string,
            {
              expiresIn: "15m"
            }
        );

        const refreshToken = jwt.sign(
            {id: user.id, role: "user"},
            process.env.REFRESH_TOKEN_SECRET as string,
            {
              expiresIn: "7d",
            }
        );
        setCookie(res, "seller-access_token", accessToken);
        setCookie(res, "seller-refresh_token", refreshToken);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        return next(error);
    }
}

export const getSeller = async(
    req:any, 
    res:Response, 
    next:NextFunction) => {
    try{
        const seller = req.user;
        res.status(201).json({
         success: true,
         seller,
        });
    }catch(error){
        return next(error);
    }
};

import axios from "axios";

export const createHubtelPayout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recipientName, recipientNumber, amount, channel } = req.body;
    if (!recipientName || !recipientNumber || !amount || !channel) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const response = await axios.post(
      `${process.env.HUBTEL_BASE_URL}/transactions/send`,
      {
        recipientName,
        recipientNumber,
        amount,
        channel, // "mtn-gh", "vodafone-gh", "airteltigo-gh", or "bank"
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.HUBTEL_API_KEY}:${process.env.HUBTEL_CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/json",
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    return next(error);
  }
};

