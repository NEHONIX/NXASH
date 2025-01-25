import { Router } from "express";
import { InstructorAuthController } from "../controllers/instructor.auth.controller";
import { instructorAuthMiddleware } from "../middlewares/instructor.auth.middleware";

const router: any = Router();

/**
 * @route   POST /api/instructor/auth/register
 * @desc    Inscription d'un nouveau professeur
 * @access  Public
 */
router.post("/register", InstructorAuthController.register);

/**
 * @route   POST /api/instructor/auth/login
 * @desc    Connexion d'un professeur
 * @access  Public
 */
router.post("/login", InstructorAuthController.login);

/**
 * @route   POST /api/instructor/auth/logout
 * @desc    Déconnexion du professeur
 * @access  Private (Instructor only)
 */
router.post(
  "/logout",
  instructorAuthMiddleware,
  InstructorAuthController.logout
);

/**
 * @route   GET /api/instructor/auth/profile
 * @desc    Récupérer le profil du professeur
 * @access  Private (Instructor only)
 */
router.get(
  "/me",
  instructorAuthMiddleware,
  InstructorAuthController.getProfile
);

/**
 * @route   PUT /api/instructor/auth/profile
 * @desc    Mettre à jour le profil du professeur
 * @access  Private (Instructor only)
 */
router.put(
  "/update-me",
  instructorAuthMiddleware,
  InstructorAuthController.updateProfile
);

/**
 * @route   GET /api/instructor/auth/check-auth
 * @desc    Vérifier si l'instructeur est authentifié
 * @access  Private (Instructor only)
 */
router.get(
  "/check-auth",
  instructorAuthMiddleware,
  InstructorAuthController.checkAuth
);

export default router;
