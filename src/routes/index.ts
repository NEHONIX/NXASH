import { Router } from "express";
import studentRoutes from "./student.routes";
import instructorRoutes from "./instructor.routes";
import instructorAuthRoutes from "./instructor.auth.routes";
import nehonixRouter from "./nehonix.routes";

const router = Router();

// Routes pour les instructeurs
router.use("/instructor/auth", instructorAuthRoutes);
router.use("/instructor", instructorRoutes);

// Routes pour les étudiants
router.use("/student", studentRoutes);

// // Routes pour les paiements
// router.use("/payment", paymentRoutes);

//nehonix
router.use("/public/v1", nehonixRouter);
export default router;
