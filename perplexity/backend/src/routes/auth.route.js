import { Router } from "express";
import { getMe, login, logout, register, verifyEmail, } from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";

const authRouter = Router();


authRouter.post("/register", registerValidator, register);
authRouter.post('/login',loginValidator,login)
authRouter.post('/logout',authUser,logout)
authRouter.get('/getme',authUser,getMe)
authRouter.get('/verify',verifyEmail)
// authRouter.post("/resend-verification", resendVerificationEmail);

export default authRouter;