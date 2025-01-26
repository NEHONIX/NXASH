import { Router } from "express";
import { AIController } from "../controllers/ai.controller";
import { checkRole } from "../middlewares/security.middleware";

const router = Router();

// Route pour l'analyse de code par IA
router.post("/analyze-code", checkRole(["student", "instructor", "admin"]), AIController.analyzeCode);

export default router;
