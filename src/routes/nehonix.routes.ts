import { Router } from "express";
import paymentRoutes from "./payment.routes"; // added import statement

const router = Router();

// Routes pour les paiements
router.use("/payments", paymentRoutes);

export default router;
