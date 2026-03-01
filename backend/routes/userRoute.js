import express from 'express';
import { loginUser,logoutUser,verifyLoginOtp,registerUser, verifyRegisterOtp, refreshAccessToken } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);

// FIX: Changed name to match your frontend Axios call
userRouter.post("/verify-otp", verifyRegisterOtp); 

userRouter.post("/refresh-token", refreshAccessToken);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.post("/verify-login", verifyLoginOtp);

export default userRouter;