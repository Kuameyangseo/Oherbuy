import crypto from "crypto"
import { ValidationError } from "../../../../packages/error-handler"
import { sendEmail } from "../utils/sendMail"
import { NextFunction } from "express";
import redis from "../../../../packages/libs/redis";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const {name, email, password, phone_number, country} = data

    if (
        !name || 
        !email || 
        !password || (userType == "seller" && (!phone_number || !country))
    ) {

        throw new ValidationError("All fields are required")
    }

    if(!emailRegex.test(email)){
        throw new ValidationError("invalid email format")
    }
}

export const checkOtpRestrictions = async(
    email:string, 
    next:NextFunction
) => {
    if (await redis.get(`otp_lock:${email}`)){
        return next(
            new ValidationError(
                "Account lock due to multiple failed attempts! Try again after 30 minutes"
            )
        );
    };

    if(await redis.get(`otp_spam_lock:${email}`)){
        return next(
            new ValidationError(
                "Too many OTP request! Please wait 1hour before requesting again"
            )
        )
    };

     if(await redis.get(`otp_cooldown:${email}`)){
        return next(
            new ValidationError(
                "Please wait 1minute before requesting a new OTP!"
            )
        )
    };
}

export const trackOtpRequests = async(
    email:string, 
    next:NextFunction
) => {
    const otpRequestKey = `otp_request_count:${email}`;
    let otpResquests = parseInt((await redis.get(otpRequestKey)) || "0");

    if(otpResquests >= 2){
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 300);
        return next(
            new ValidationError(
                "Too many OTP request! Please wait 1 hour before requesting again"
            )
        );
    }

    await redis.set(otpRequestKey, otpResquests + 1, "EX", 3600);
}

export const sendOtp = async (
    name:string, 
    email:string, 
    template:string
) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify Your Email", template, {name, otp});
    await redis.set(`otp:${email}`, otp, "EX", 300);
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60)
}