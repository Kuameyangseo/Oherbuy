import express from 'express';
import { createHubtelPayout, createSellerShop, getSeller, getUser, loginSeller, loginUser, 
         refreshToken, 
         registerSeller, 
         resetUserPassword,
         userForgotPassword, 
         userRegistration,
         verifySeller,
         verifyUser } from '../controller/auth.controller';
import { verifyUserForgotPasswordOtp } from '../utils/auth.helper';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';
import { isSeller } from '../../../../packages/middleware/authorizeRoles';


const router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser); 
router.post("/refresh-token", refreshToken);
router.post("/logged-in-user", isAuthenticated,getUser);
router.get("/logged-in-user", isAuthenticated,getUser);
router.post("/forgot-user-password", userForgotPassword); 
router.post("/reset-password-user", resetUserPassword); 
router.post("/verify-forgot-user", verifyUserForgotPasswordOtp); 
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-seller-shop", createSellerShop);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller",isAuthenticated, isSeller, getSeller);
router.post("/create-hubtel-payout", createHubtelPayout);
 

export default router;