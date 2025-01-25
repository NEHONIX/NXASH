import { ReferalReward } from "./referal";

/**
 * Types pour l'invitation d'amis
 */
export interface InviteFriendsRequest {
  emails: string[]; // Liste des emails à inviter
}

export interface InviteFriendsResponse {
  status: "success";
  message: string;
  data: {
    referalCode: string; // Code de parrainage unique
    invitedCount: number; // Nombre d'emails invités
  };
}

/**
 * Types pour les statistiques de parrainage
 */
export interface ReferalStatsResponse {
  status: "success";
  data: {
    referalCode: string; // Code de parrainage de l'étudiant
    invitedCount: number; // Nombre total d'invitations envoyées
    registeredCount: number; // Nombre de personnes inscrites via le parrainage
    totalReferals: number; // Nombre total de parrainages réussis
  };
}

/**
 * Types pour l'historique des parrainages
 */
export interface RegisteredReferal {
  id: string; // ID de l'utilisateur parrainé
  name: string; // Nom de l'utilisateur parrainé
  email: string; // Email de l'utilisateur parrainé
  registeredAt: Date; // Date d'inscription
}

export interface ReferalHistoryResponse {
  status: "success";
  data: {
    invitedEmails: string[]; // Liste des emails invités
    registeredReferals: RegisteredReferal[]; // Liste des utilisateurs inscrits via parrainage
  };
}

/**
 * Types pour les récompenses
 */
export interface ReferalRewardsResponse {
  status: "success";
  data: {
    availableRewards: ReferalReward[]; // Toutes les récompenses disponibles
    unlockedRewards: ReferalReward[]; // Récompenses débloquées mais pas encore réclamées
    claimedRewards: ReferalReward[]; // Récompenses déjà réclamées
  };
}

export interface ClaimRewardRequest {
  rewardId: string; // ID de la récompense à réclamer
}

export interface ClaimRewardResponse {
  status: "success";
  message: string;
  data: {
    reward: ReferalReward; // Détails de la récompense réclamée
  };
}

/**
 * Type pour les documents Firestore
 */
export interface ReferalDocument {
  studentId: string; // ID de l'étudiant parrain
  referalCode: string; // Code de parrainage unique
  invitedEmails: string[]; // Liste des emails invités
  registeredReferals: string[]; // Liste des IDs des utilisateurs parrainés
  totalReferals: number; // Nombre total de parrainages réussis
  claimedRewards: string[]; // Liste des IDs des récompenses réclamées
  createdAt: Date; // Date de création du document
  updatedAt: Date; // Date de dernière mise à jour
}

/**
 * Types pour les erreurs API
 */
export interface ApiErrorResponse {
  status: "fail";
  message: string;
  statusCode: number;
  isOperational: boolean;
}

/**
 * Types pour les mises à jour utilisateur liées aux récompenses
 */
export interface UserRewardUpdates {
  nextPaymentDiscount?: number; // Pourcentage de réduction sur le prochain paiement
  specialAccess?: boolean; // Accès spécial aux cours
  specialAccessExpiry?: Date; // Date d'expiration de l'accès spécial
  updatedAt: Date; // Date de mise à jour
}

/**
 * Types pour les mises à jour d'abonnement liées aux récompenses
 */
export interface SubscriptionRewardUpdates {
  prochainPaiement: Date; // Nouvelle date de paiement (après ajout de jours bonus)
  updatedAt: Date; // Date de mise à jour
}
