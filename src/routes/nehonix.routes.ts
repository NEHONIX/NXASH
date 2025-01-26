import { Router } from "express";
import paymentRoutes from "./payment.routes";
import aiRoutes from "./ai.routes";

const router = Router();

// Routes pour les paiements
router.use("/payments", paymentRoutes);

// Routes pour l'IA
router.use("/ai", aiRoutes);

export default router;
