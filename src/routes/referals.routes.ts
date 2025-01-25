import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ReferalController } from "../controllers/referal.controller";

const router: any = Router();

/**
 * @route   POST /api/student/dashboard/referals/invite
 * @desc    Inviter des amis par email
 * @access  Private (Student only)
 */
router.post("/invite", authMiddleware, ReferalController.inviteFriends);

/**
 * @route   GET /api/student/dashboard/referals/stats
 * @desc    Obtenir les statistiques de parrainage
 * @access  Private (Student only)
 */
router.get("/stats", authMiddleware, ReferalController.getReferalStats);

/**
 * @route   GET /api/student/dashboard/referals/history
 * @desc    Obtenir l'historique des parrainages
 * @access  Private (Student only)
 */
router.get("/history", authMiddleware, ReferalController.getReferalHistory);

/**
 * @route   GET /api/student/dashboard/referals/rewards
 * @desc    Obtenir les récompenses disponibles et débloquées
 * @access  Private (Student only)
 */
router.get("/rewards", authMiddleware, ReferalController.getReferalRewards);

/**
 * @route   POST /api/student/dashboard/referals/rewards/:rewardId/claim
 * @desc    Réclamer une récompense
 * @access  Private (Student only)
 */
router.post("/rewards/:rewardId/claim", authMiddleware, ReferalController.claimReward);

export default router;
