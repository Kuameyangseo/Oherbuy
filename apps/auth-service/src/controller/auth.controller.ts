import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";
import { checkOtpRestrictions, handlerForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp, verifyUserForgotPasswordOtp } from "../utils/auth.helper";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import axios from "axios";



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
        const {email, otp, password, name, country} = req.body;
        if(!email || !otp || !password || !name){
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
                country: country || "Unknown",
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


        // do not clear seller cookies here so user and seller sessions can coexist

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
        setCookie(res, "access-token", accessToken);
        setCookie(res, "refresh-token", refreshToken);
        // mark active role for this client
        setCookie(res, 'active-role', 'user', { httpOnly: false });

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

export const googleLoginCallback = (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user?.id) {
            return next(new ValidationError("Google login did not return a user"));
        }

        const accessToken = jwt.sign(
            { id: user.id, role: "user" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { id: user.id, role: "user" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );

        setCookie(res, "access-token", accessToken);
        setCookie(res, "refresh-token", refreshToken);
        setCookie(res, "active-role", "user", { httpOnly: false });

        return res.redirect(`${process.env.SERVER_URI || 'http://localhost:3000'}/`);
    } catch (error) {
        return next(error);
    }
};

//Refresh Token
export const refreshToken = async(
    req:any, 
    res:Response, 
    next:NextFunction) => {
    try{
        // prefer refresh token based on client's active-role cookie (if present)
        const activeRole = req.cookies['active-role'];
        let refreshToken = undefined as string | undefined;
        if (activeRole === 'seller') {
            refreshToken = req.cookies['seller-refresh-token'] || req.headers.authorization?.split(" ")[1];
        } else if (activeRole === 'user') {
            refreshToken = req.cookies['refresh-token'] || req.headers.authorization?.split(" ")[1];
        } else {
            refreshToken = req.cookies['refresh-token'] || req.cookies['seller-refresh-token'] || req.headers.authorization?.split(" ")[1];
        }

        if (!refreshToken) {
            return next(new ValidationError("Refresh token not provided"));
        }

        const decoded = jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_SECRET as string
        ) as {id: string, role: string};

        // allow both user and seller roles
        if (!decoded || !decoded.id || (decoded.role !== "user" && decoded.role !== "seller")) {
            return next(new ValidationError("Invalid token role"));
        }

        let account;
        if (decoded.role === "user") {
            account = await prisma.users.findUnique({
               where: {id: decoded.id}});
        } else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({
                where: {id: decoded.id},
                include: { shop: true }
            });
        }
            
        if (!account) {
            return next(new ValidationError("Forbidden! User/seller not found"));
        }

        // create a single new access token preserving the role
        const newAccessToken = jwt.sign(
            {id: account.id, role: decoded.role},
            process.env.ACCESS_TOKEN_SECRET as string,
            {expiresIn: "15m"}
        );

        if (decoded.role === "user") {
            setCookie(res, "access-token", newAccessToken);
        } else if (decoded.role === "seller") {
            setCookie(res, "seller-access-token", newAccessToken);
        }

        req.role = decoded.role;

        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
        });
    } catch(error){
        return next(error);
    }
};

export const getUser = async(req:any, res:Response, next:NextFunction) => {
    try{
        // Prefer returning the standard `user` object when present (role: user),
        // otherwise fall back to `seller` so the frontend can display a name
        // when the active role is seller. Normalize the returned object to
        // contain id, name and email.
        const actor = req.user ?? req.seller;
        if (!actor) {
            return res.status(200).json({ success: true, user: null });
        }
        const normalized = {
            id: actor.id,
            name: actor.name,
            email: actor.email,
        };
        return res.status(200).json({ success: true, user: normalized });
    }catch(error){
        return next(error);
    }
};

// Public: Get all products for user UI
export const getAllProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await prisma.products.findMany({
            where: {
                isDeleted: false,
                status: "Active",
            },
            include: {
                images: true,
                shops: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({ success: true, products });
    } catch (error) {
        // Provide a clearer message for connectivity issues (Prisma P2010 / server selection timeout)
        const msg = (error as any)?.message || String(error);
        console.error('Error in getAllProduct:', msg);
        if ((error as any)?.code === 'P2010' || msg.includes('Server selection timeout') || msg.includes('No available servers')) {
            return res.status(503).json({ success: false, message: 'Service temporarily unavailable: database connection error' });
        }
        return next(error);
    }
};

// Get product by slug
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        if (!slug) return res.status(400).json({ success: false, message: 'Slug is required' });

        const product = await prisma.products.findUnique({
            where: { slug },
            include: { images: true, shops: true },
        });

        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        return res.status(200).json({ success: true, product });
    } catch (error) {
        return next(error);
    }
};

// Public: Get shops for the user UI
export const getAllShops = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shops = await prisma.shops.findMany({
            orderBy: { createdAt: "desc" },
        });

        const shopsWithAvatars = await Promise.all(
            shops.map(async (shop) => {
                const avatar = await prisma.images.findFirst({
                    where: { shopId: shop.id },
                    orderBy: { id: 'desc' },
                    select: { url: true },
                });
                return { ...shop, image: avatar?.url || null };
            })
        );

        return res.status(200).json({ success: true, shops: shopsWithAvatars });
    } catch (error) {
        return next(error);
    }
};

export const getShop = async (req: any, res: Response, next: NextFunction) => {
    try {
        const shop = await prisma.shops.findUnique({
            where: { id: req.params.id },
        });

        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
        if (req.seller?.shop?.id !== shop.id) {
            return res.status(403).json({ success: false, message: 'You do not own this shop' });
        }

        const avatar = await prisma.images.findFirst({
            where: { shopId: shop.id },
            orderBy: { id: 'desc' },
            select: { url: true },
        });

        return res.status(200).json({
            success: true,
            shop: { ...shop, image: avatar?.url || null },
        });
    } catch (error) {
        return next(error);
    }
};

export const updateShop = async (req: any, res: Response, next: NextFunction) => {
    try {
        const shop = await prisma.shops.findUnique({ where: { id: req.params.id } });
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
        if (req.seller?.shop?.id !== shop.id) {
            return res.status(403).json({ success: false, message: 'You do not own this shop' });
        }

        const { name, bio, image, coverBanner } = req.body;
        let avatarId = shop.avatarId;

        if (image !== undefined) {
            await prisma.images.deleteMany({ where: { shopId: shop.id } });
            const avatar = await prisma.images.create({
                data: {
                    file_id: image,
                    url: image,
                    shopId: shop.id,
                },
            });
            avatarId = avatar.id;
        }

        const updatedShop = await prisma.shops.update({
            where: { id: shop.id },
            data: {
                ...(name !== undefined && { name }),
                ...(bio !== undefined && { bio }),
                ...(coverBanner !== undefined && { coverBanner }),
                ...(image !== undefined && { avatarId }),
            },
        });

        return res.status(200).json({ success: true, shop: updatedShop });
    } catch (error) {
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

/*-----------SELLER-UI CONTROLLERS--------------------- */

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

        const seller = await prisma.sellers.findUnique({where: { email }});

        if (!seller){
            return next(new ValidationError("Seller does not exist with this email"));
        }

        const isPasswordValid = await bcrypt.compare(password, seller.password);

        if (!isPasswordValid){
            return next(new ValidationError("Invalid credentials"));
        }


        // do not clear user cookies here so user and seller sessions can coexist


        const accessToken = jwt.sign(
            {id: seller.id, role: "seller"},
            process.env.ACCESS_TOKEN_SECRET as string,
            {
              expiresIn: "15m"
            }
        );

        const refreshToken = jwt.sign(
            {id: seller.id, role: "seller"},
            process.env.REFRESH_TOKEN_SECRET as string,
            {
              expiresIn: "7d",
            }
        );
        setCookie(res, "seller-access-token", accessToken);
        setCookie(res, "seller-refresh-token", refreshToken);
        // mark active role for this client
        setCookie(res, 'active-role', 'seller', { httpOnly: false });

        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            seller: {
                id: seller.id,
                name: seller.name,
                email: seller.email,
            }
        });

    } catch (error) {
        return next(error);
    }
}



export const getSeller = async (req: any, res: Response, next: NextFunction) => {
  try {
    // determine seller id set by auth middleware
    const sellerId = req.seller?.id || req.user?.id || req.params?.id;
    if (!sellerId) {
      return next(new ValidationError("Seller id not provided"));
    }

    // fetch seller from DB including the shop relation so frontend receives seller.shop.name
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

        const shop = seller.shop
            ? {
                    ...seller.shop,
                    image: (await prisma.images.findFirst({
                        where: { shopId: seller.shop.id },
                        orderBy: { id: 'desc' },
                        select: { url: true },
                    }))?.url || null,
                }
            : null;

        return res.status(200).json({
            success: true,
            seller: { ...seller, shop },
        });
  } catch (error) {
    return next(error);
  }
};

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

// Logout handler: clears both user and seller auth cookies
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear user tokens
    res.clearCookie("access-token");
    res.clearCookie("refresh-token");

    // Clear seller tokens
    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");
    // Clear active-role cookie so client no longer prefers a role
    res.clearCookie('active-role');

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return next(error);
  }
};


export const switchRole = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body as { role?: string }
    if (!role || (role !== 'user' && role !== 'seller')) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    // ensure requester is authenticated
    if (!req.role) return res.status(401).json({ success: false, message: 'Unauthorized' })

    const email = req.user?.email ?? req.seller?.email
    if (!email) return res.status(400).json({ success: false, message: 'Email not found in requester' })

    // defensive: ensure prisma client has accounts model (after schema change you must run `prisma generate`)
    if (!('accounts' in prisma)) {
      return res.status(501).json({ success: false, message: 'Server not configured: prisma.accounts model missing. Run `npx prisma generate` and restart the server.' })
    }

        let account = await prisma.accounts.findUnique({ where: { email } })

        // If account record doesn't exist, try to create one automatically from
        // existing `users` / `sellers` records that share the same email. This
        // allows backwards compatibility for users who created both profiles
        // separately but haven't had an `accounts` row created yet.
        if (!account) {
            const foundUser = await prisma.users.findUnique({ where: { email } });
            const foundSeller = await prisma.sellers.findUnique({ where: { email } });

            if (!foundUser && !foundSeller) {
                return res.status(404).json({ success: false, message: 'Account not linked' })
            }

            const roles: string[] = [];
            if (foundUser) roles.push('user');
            if (foundSeller) roles.push('seller');

            account = await prisma.accounts.create({
                data: {
                    email,
                    userId: foundUser?.id ?? null,
                    sellerId: foundSeller?.id ?? null,
                    // store roles as an array/string depending on your schema; using JSON-compatible value
                    roles,
                },
            });
        }

    if (role === 'seller') {
      if (!account.sellerId) return res.status(403).json({ success: false, message: 'Seller role not linked to account' })
      const seller = await prisma.sellers.findUnique({ where: { id: account.sellerId } })
      if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' })

            const accessToken = jwt.sign({ id: seller.id, role: 'seller' }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })
            const refreshToken = jwt.sign({ id: seller.id, role: 'seller' }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' })
            setCookie(res, 'seller-access-token', accessToken)
            setCookie(res, 'seller-refresh-token', refreshToken)
            // set active role so middleware picks seller token
            setCookie(res, 'active-role', 'seller', { httpOnly: false })
            return res.status(200).json({ success: true, role: 'seller' })
    }

    // role === 'user'
    if (!account.userId) return res.status(403).json({ success: false, message: 'User role not linked to account' })
    const user = await prisma.users.findUnique({ where: { id: account.userId } })
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const accessToken = jwt.sign({ id: user.id, role: 'user' }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })
    const refreshToken = jwt.sign({ id: user.id, role: 'user' }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' })
    setCookie(res, 'access-token', accessToken)
    setCookie(res, 'refresh-token', refreshToken)
    // set active role so middleware picks user token
    setCookie(res, 'active-role', 'user', { httpOnly: false })
    return res.status(200).json({ success: true, role: 'user' })

  } catch (error) {
    return next(error)
  }
}

export const getAccountForCurrentUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const email = req.user?.email ?? req.seller?.email
    if (!email) return res.status(400).json({ success: false, message: 'Email not found' })

    if (!('accounts' in prisma)) {
      return res.status(501).json({ success: false, message: 'Server not configured: prisma.accounts model missing. Run `npx prisma generate` and restart the server.' })
    }

        let account = await prisma.accounts.findUnique({ where: { email } })

        // If account does not exist, attempt to create it from existing user/seller
        // records that share the same email. This helps when user and seller were
        // created separately but no accounts row was created yet.
        if (!account) {
            const foundUser = await prisma.users.findUnique({ where: { email } });
            const foundSeller = await prisma.sellers.findUnique({ where: { email } });
            if (!foundUser && !foundSeller) {
                return res.status(404).json({ success: false, message: 'Account not found' })
            }
            const roles: string[] = []
            if (foundUser) roles.push('user')
            if (foundSeller) roles.push('seller')
            account = await prisma.accounts.create({
                data: {
                    email,
                    userId: foundUser?.id ?? null,
                    sellerId: foundSeller?.id ?? null,
                    roles,
                },
            })
        }

        return res.status(200).json({ success: true, account: {
            email: account.email,
            roles: account.roles,
            userId: account.userId,
            sellerId: account.sellerId,
        } })
  } catch (error) {
    return next(error)
  }
}