import { Timestamp } from "firebase-admin/firestore";
import { StudentLevel } from "./course";

/**
 * Types de base pour les paiements
 */

/** Statuts possibles pour une session de paiement */
export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "awaiting_orange_code"
  | "processing";

/** Méthodes de paiement disponibles */
export type PaymentMethod = "orange" | "mtn" | "moov";

/**
 * Interface principale pour une session de paiement
 * Contient toutes les informations relatives à une transaction
 */
export interface IPaymentSession {
  /** Identifiant unique de la session de paiement */
  id: string;
  /** Référence unique du paiement */
  paymentRef: string;
  /** Identifiant de l'utilisateur qui effectue le paiement */
  userId: string;
  /** Email de l'étudiant pour la communication */
  studentEmail: string;
  /** Numéro de téléphone de l'étudiant */
  studentPhone?: string;
  /** Montant du paiement en FCFA */
  amount: number;
  /** Méthode de paiement choisie */
  paymentMethod: PaymentMethod;
  /** Numéro de téléphone utilisé pour le paiement */
  paymentPhoneNumber: string;
  /** Statut actuel du paiement */
  status: PaymentStatus;
  /** Code de vérification (uniquement pour Orange Money) */
  verificationCode?: string;
  /** Code Orange Money */
  orangeCode?: string;
  /** Indique si le code a été vérifié (Orange Money) */
  codeVerified?: boolean;
  /** Note ajoutée par l'administrateur (surtout en cas de rejet) */
  adminNote?: string;
  /** Informations sur le dispositif utilisé */
  deviceInfo?: string;
  /** Specialité de l'étudiant */
  specialty: string;
  /** ID de l'administrateur qui a traité le paiement */
  processedBy?: string;
  /** Indique si l'administrateur traite actuellement ce paiement */
  adminProcessing?: boolean;
  /** Date de création de la session */
  createdAt: Timestamp | Date;
  /** Date de dernière modification */
  updatedAt: Timestamp | Date;
  /** ID de l'abonnement lié (si existant) */
  subscriptionId?: string;
  /** Indique si l'abonnement a été activé */
  subscriptionActivated?: boolean;
}

/**
 * Interface pour les statistiques globales des paiements
 * Utilisée dans le tableau de bord administrateur
 */
export interface IPaymentStats {
  /** Nombre total de sessions de paiement */
  total: number;
  /** Nombre de paiements en attente */
  pending: number;
  /** Nombre de paiements approuvés */
  approved: number;
  /** Nombre de paiements rejetés */
  rejected: number;
  /** Nombre de paiements en attente du code Orange */
  awaiting_orange_code: number;
  /** Nombre de paiements en cours de traitement */
  processing: number;
  /** Montant total des paiements approuvés (FCFA) */
  totalAmount: number;
  /** Montant total des paiements approuvés aujourd'hui (FCFA) */
  todayAmount: number;
  /** Montant total des paiements approuvés cette semaine (FCFA) */
  weekAmount: number;
  /** Montant total des paiements approuvés ce mois (FCFA) */
  monthAmount: number;
}

/**
 * Interfaces pour les réponses API
 */

/**
 * Réponse pour la liste des paiements
 * GET /api/instructor/payments
 */
export interface IGetPaymentsResponse {
  /** Indique si la requête a réussi */
  success: boolean;
  /** Liste des sessions de paiement */
  data: IPaymentSession[];
  /** Informations de pagination */
  pagination?: {
    /** Page actuelle */
    currentPage: number;
    /** Nombre total de pages */
    totalPages: number;
    /** Nombre total d'éléments */
    totalItems: number;
    /** Nombre d'éléments par page */
    itemsPerPage: number;
  };
}

/**
 * Réponse pour les statistiques de paiement
 * GET /api/instructor/payments/stats
 */
export interface IGetPaymentStatsResponse {
  success: boolean;
  data: IPaymentStats;
}

/**
 * Réponse pour les détails d'une session
 * GET /api/instructor/payments/:paymentRef
 */
export interface IGetPaymentSessionResponse {
  success: boolean;
  data: IPaymentSession;
}

/**
 * Requête pour mettre à jour le statut d'un paiement
 * PUT /api/instructor/payments/:paymentRef/status
 */
export interface IUpdatePaymentStatusRequest {
  /** Nouveau statut à appliquer */
  status: PaymentStatus;
  /** Note explicative (obligatoire en cas de rejet) */
  adminNote?: string;
}

/**
 * Réponse après mise à jour du statut
 */
export interface IUpdatePaymentStatusResponse {
  success: boolean;
  /** Message de confirmation */
  message: string;
  data: {
    /** Référence du paiement modifié */
    paymentRef: string;
    /** Nouveau statut */
    status: PaymentStatus;
    /** Note administrative */
    adminNote?: string;
  };
}

/**
 * Interface pour les filtres de recherche de paiements
 * Utilisée pour filtrer la liste des paiements
 */
export interface IPaymentFilters {
  /** Filtrer par statut */
  status?: PaymentStatus | "all";
  /** Date de début pour la période */
  startDate?: Date;
  /** Date de fin pour la période */
  endDate?: Date;
  /** Filtrer par méthode de paiement */
  paymentMethod?: PaymentMethod;
  /** Recherche par email ou référence */
  searchTerm?: string;
  /** Numéro de page pour la pagination */
  page?: number;
  /** Nombre d'éléments par page */
  limit?: number;
}

/**
 * Interface pour une session de paiement via PayUnit
 */
export interface PaymentSession {
  id: string;
  userId: string;
  amount: number;
  specialty: StudentLevel;
  paymentUrl: string;
  status: "pending" | "completed" | "failed" | "expired";
  createdAt: Date;
  expiresAt: Date;
  transactionId?: string;
  paymentMethod?: string;
  currency: string;
  metadata?: {
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    formationLevel: string;
  };
}

/**
 * Interface pour la configuration de PayUnit
 */
export interface PayUnitConfig {
  apiKey: string;
  apiSecret: string;
  appToken: string;
  callbackUrl: string;
  returnUrl: string;
  cancelUrl: string;
  mode: "test" | "live";
}

/**
 * Interface pour la réponse de PayUnit
 */
export interface PayUnitResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    t_id: string;
    t_sum: string;
    t_url: string;
    transaction_id: string;
    transaction_url: string;
    providers: Array<{
      shortcode: string;
      name: string;
      logo: string;
      status: string;
      country: {
        country_name: string;
        country_code: string;
      };
    }>;
  };
}

/** Prix des formations par niveau */
export const FORMATION_PRICES: Record<StudentLevel, number> = {
  "FrontEnd-N0": 3000,
  "BackEnd-N0": 3000,
  "FullStack-F0": 10000,
  "FrontEnd-N1": 5000,
  "BackEnd-N1": 5000,
  "FullStack-F1": 15000,
  "FrontEnd-N2": 35000,
  "BackEnd-N2": 10000,
  "FullStack-F2": 80000,
} as const;
