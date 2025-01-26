export type StudentLevel =
  | "FrontEnd-N0" //Prix de la formation: 3000FCFA
  | "BackEnd-N0" //Prix de la formation: 3000FCFA
  | "FullStack-F0" //Prix de la formation: 10000FCFA
  | "FrontEnd-N1" //Prix de la formation: 5000FCFA
  | "BackEnd-N1" //Prix de la formation: 5000FCFA
  | "FullStack-F1" //Prix de la formation: 15000FCFA
  | "FrontEnd-N2" //Prix de la formation: 35000FCFA
  | "BackEnd-N2" //Prix de la formation: 10000FCFA
  | "FullStack-F2"; //Prix de la formation: 80000FCFA

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
  /** Identifiant de l'utilisateur qui effectue le paiement */
  userId: string;
  /** Email de l'étudiant pour la communication */
  studentEmail: string;
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
  orangeCode?: string;
  /** Indique si le code a été vérifié (Orange Money) */
  codeVerified?: boolean;
  /** Note ajoutée par l'administrateur (surtout en cas de rejet) */
  adminNote?: string;
  /** ID de l'administrateur qui a traité le paiement */
  processedBy?: string;
  /** Date de création de la session */
  createdAt: string | Date;
  /** Date de dernière modification */
  updatedAt: string | Date;
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
  /** Montant total des paiements approuvés (FCFA) */
  totalAmount: number;
  /** Montant total des paiements approuvés aujourd'hui (FCFA) */
  todayAmount: number;
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
