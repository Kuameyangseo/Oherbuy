import express from 'express';
import { createHubtelPayout, createSellerShop,  getSeller, getUser, getAllProduct, getAllShops, getShop, updateShop, getProductBySlug, loginSeller, loginUser, 
         refreshToken, 
         registerSeller, 
         resetUserPassword,
         userForgotPassword, 
         userRegistration,
         verifySeller,
         verifyUser, logout } from '../controller/auth.controller';
import { verifyUserForgotPasswordOtp } from '../utils/auth.helper';
import { switchRole, getAccountForCurrentUser } from '../controller/auth.controller';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';
import { isSeller } from '../../../../packages/middleware/authorizeRoles';
import passport from 'passport';
import { googleLoginCallback } from '../controller/auth.controller';

 
const router = express.Router();

router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}));
router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: `${process.env.SERVER_URI || 'http://localhost:3000'}/login?error=google_auth_failed`,
    session: false,
}), googleLoginCallback);

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser); 
router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated,getUser);
router.get("/products", getAllProduct);
router.get("/shops", getAllShops);
router.get("/shops/:id", isAuthenticated, isSeller, getShop);
router.patch("/shops/:id", isAuthenticated, isSeller, updateShop);
// expose product-by-slug
router.get("/products/:slug", getProductBySlug);
// switch linked roles (user <-> seller)
router.post('/accounts/switch-role', isAuthenticated, switchRole);
router.get('/accounts/me', isAuthenticated, getAccountForCurrentUser);
router.post("/forgot-user-password", userForgotPassword); 
router.post("/reset-password-user", resetUserPassword); 
router.post("/verify-forgot-user", verifyUserForgotPasswordOtp); 
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-seller-shop", createSellerShop);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller",isAuthenticated, isSeller, getSeller);
router.post("/create-hubtel-payout", isAuthenticated, isSeller, createHubtelPayout);
router.post("/logout", logout);
router.get("/logout", logout);


export default router;
