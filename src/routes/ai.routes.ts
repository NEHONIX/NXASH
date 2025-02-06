import { Router } from "express";
import { AIController } from "../controllers/ai.controller";
import { checkRole } from "../middlewares/security.middleware";

const router = Router();

// Route pour l'analyse de code par IA
// checkRole(["student", "instructor", "admin"])
router.post("/analyze-code", AIController.analyzeCode);

export default router;
 