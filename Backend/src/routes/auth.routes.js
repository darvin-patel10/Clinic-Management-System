import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", authController.register);

authRouter.post("/login", authController.login);

authRouter.post("/verify-email", authController.verifyEmail);

authRouter.get("/get-me", authenticate, authController.getMe);

authRouter.get("/refresh-token", authController.refreshToken);

authRouter.get("/logout", authController.logout);

authRouter.post("/forgot-password", authController.forgotPassword);

authRouter.post("/reset-password", authController.resetPassword);

authRouter.post("/otp-verify", authController.otpverify);

authRouter.post("/clinic-info", authenticate, authController.clinicInfo);


// authRouter.post("/login", (req, res) => {
//     res.send("login");
// })

export default authRouter;