import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";
import compression from "compression";
import doteven from "dotenv";
doteven.config();

// Rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limite chaque IP à 300 requêtes par fenêtre
  message:
    "Trop de requêtes depuis cette IP, veuillez réessayer après 15 minutes",
});

// Limiteur spécifique pour la vérification du statut de paiement
export const paymentStatusLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 secondes
  max: 3, // 3 requêtes maximum toutes les 10 secondes
  message: "Veuillez patienter quelques secondes avant de vérifier à nouveau",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Utilise la combinaison IP + paymentRef comme clé
    return `${req.ip}-${req.params.paymentRef}`;
  },
});

// Protection XSS
export const xssMiddleware = xss();

// Configuration Helmet
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://firestore.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
});

// Configuration CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "https://www.academy.nehonix.space",
  "https://academy.nehonix.space",
  "https://www.nehonix.space",
  "https://nehonix.space",
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Non autorisé par CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  maxAge: 600, // 10 minutes
});

// Compression
export const compressionMiddleware = compression();

// Middleware pour vérifier le rôle
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        error: "Non authentifié",
      });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé",
      });
    }

    next();
  };
};
