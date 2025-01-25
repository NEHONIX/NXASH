import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: any = Router();

// Routes publiques
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Routes protégées
router.get("/check-auth", authMiddleware, AuthController.checkAuth);

export default router;
