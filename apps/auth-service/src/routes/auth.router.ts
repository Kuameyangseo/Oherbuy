import express from 'express';
import { loginUser, resetUserPassword, userForgotPassword, userRegistration, verifyUser } from '../controller/auth.controller';
import { verifyForgotPasswordOtp } from '../utils/auth.helper';


const router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser); 
router.post("/forgot-user-password", userForgotPassword); 
router.post("/reset-password-user", resetUserPassword); 
router.post("/verify-forgot-user", verifyForgotPasswordOtp); 

export default router;   