import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from "../utils/auth.helper";
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

export const verifyUser = async(
    req: Request, 
    res: Response,
    next:NextFunction
) => {
    try {
        const {email,otp,password,name} = req.body;
        if(!email || !otp || !password || !name ){
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
