import { OrangeClientNotifMsg } from "./payments.msg";

// Types
type PaymentMethodType = "orange" | "mtn" | "moov";

export interface PaymentData {
  amount: number;
  verificationCode?: string;
  paymentPhoneNumber: string;
  paymentMethod: PaymentMethodType;
  orangeTransactionId?: string;
}

// Templates de messages
export interface NotificationTemplateProps {
  paymentRef: string;
  amount: number;
  specialty: string;
  name: string;
  paymentPhoneNumber: string;
  email?: string;
}

export const generateClientNotification = ({
  paymentRef,
  amount,
  specialty,
  name,
  paymentPhoneNumber,
}: NotificationTemplateProps) => {
  return OrangeClientNotifMsg({
    amount,
    name,
    paymentPhoneNumber,
    paymentRef,
    specialty,
  });
};

export const generateAdminNotification = ({
  paymentRef,
  amount,
  paymentPhoneNumber,
  email,
}: NotificationTemplateProps) => {
  return `
Référence: ${paymentRef}
Méthode: Orange Money
Montant: ${amount} FCFA
Numéro Orange Money: ${paymentPhoneNumber}
Email: ${email}

Actions à effectuer :
1. Initier le paiement
2. Attendez que l'étudiant valide et fournisse le code
3. Vérifiez le code et validez le paiement`;
};

export const generateMTNMoovNotification = ({
  paymentRef,
  amount,
  paymentPhoneNumber,
  email,
}: NotificationTemplateProps) => {
  return `
Référence: ${paymentRef}
Montant: ${amount} FCFA
Numéro: ${paymentPhoneNumber}
Email: ${email}

Un paiement est en attente de traitement.
Veuillez contacter l'étudiant pour finaliser la transaction.`;
};
