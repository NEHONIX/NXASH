import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { DashboardController } from "../controllers/dashboard.controller";

const router: any = Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Récupère toutes les statistiques du tableau de bord
 * @access  Private
 */
router.get("/stats", authMiddleware, DashboardController.getStats);

/**
 * @route   GET /api/dashboard/activities
 * @desc    Récupère les activités récentes de l'utilisateur
 * @access  Private
 */
router.get("/activities", authMiddleware, DashboardController.getActivities);

/**
 * @route   GET /api/dashboard/next-lesson
 * @desc    Récupère les informations sur le prochain cours
 * @access  Private
 */
router.get("/next-lesson", authMiddleware, DashboardController.getNextLesson);

/**
 * @route   GET /api/dashboard/referrals
 * @desc    Récupère les informations sur les parrainages
 * @access  Private
 */
router.get("/referrals", authMiddleware, DashboardController.getReferrals);

/**
 * @route   GET /api/dashboard/subscription
 * @desc    Récupère le statut de l'abonnement
 * @access  Private
 */

router.get(
  "/subscription",
  authMiddleware,
  DashboardController.getSubscription
);

export default router;
