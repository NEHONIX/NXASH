import { Timestamp } from "firebase-admin/firestore";
import { FirestoreTimestamp } from "../utils/dateUtils";

export type SubscriptionStatus = "actif" | "inactif" | "suspendu" | "expire";
export type PaymentStatus = "reussi" | "echoue" | "en_attente";

export interface PaymentHistory {
  paymentRef: string;
  montant: number;
  datePaiement: Date;
  status: PaymentStatus;
  methode: string;
}

export interface Subscription {
  id: string;
  userId: string;
  specialty: string;
  status: SubscriptionStatus;
  montantMensuel: number;
  dateDebut: Date;
  dateFin: Date;
  prochainPaiement: FirestoreTimestamp;
  historiquePayments: PaymentHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  nom: string;
  description: string;
  montantMensuel: number;
  duree: number; // en mois
  avantages: string[];
  actif: boolean;
}

// Type pour la conversion entre Firestore et l'application
export interface FirestoreSubscription
  extends Omit<
    Subscription,
    | "dateDebut"
    | "dateFin"
    | "prochainPaiement"
    | "createdAt"
    | "updatedAt"
    | "historiquePayments"
  > {
  dateDebut: Timestamp;
  dateFin: Timestamp;
  prochainPaiement: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  historiquePayments: Array<
    Omit<PaymentHistory, "datePaiement"> & { datePaiement: Timestamp }
  >;
}
