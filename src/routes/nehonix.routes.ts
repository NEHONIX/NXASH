import { Router } from "express";
import paymentRoutes from "./payment.routes";
import aiRoutes from "./ai.routes";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Routes pour les paiements
router.use("/payments", paymentRoutes);

router.use(authMiddleware);

// Routes pour l'IA
router.use("/ai", aiRoutes);

export default router;
