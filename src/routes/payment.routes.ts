import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { paymentStatusLimiter } from "../middlewares/security.middleware";
import { testMail } from "../utils/sendMail";

const router = Router();

/**
 * @route   POST /api/public/v1/payments/initialize
 * @desc    Initialiser une session de paiement
 * @access  Public
 */
// Route pour initialiser un paiement
router.post("/initialize", PaymentController.initializePayment);

/**
 * @route   POST /api/public/v1/payments/orange/submit-code
 * @desc    Soumettre le code Orange
 * @access  Public
 */
// Route pour soumettre le code Orange
// router.post("/orange/submit-code",  PaymentController.submitOrangeCode);

/**
 * @route   POST /api/public/v1/payments/verify-orange-code
 * @desc    Vérifier le code Orange
 * @access  Public
 */
// Route pour vérifier le code Orange
router.post("/verify-orange-code", PaymentController.submitOrangeCode);

/**
 * @route   GET /api/public/v1/payments/status/:paymentRef
 * @desc    vérifier le statut d'un paiement
 * @access  Public
 */
// Route pour vérifier le statut d'un paiement
router.get(
  "/status/:paymentRef",
  paymentStatusLimiter,
  PaymentController.checkPaymentStatus
);

// Route pour vérifier le statut d'un paiement
router.get("/mail", testMail);

export default router;
