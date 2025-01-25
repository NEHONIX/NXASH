import { firestore } from "../conf/firebase";
import {
  Subscription,
  SubscriptionStatus,
  FirestoreSubscription,
} from "../types/subscription";
import ApiError from "../utils/ApiError";
import { sendMailNotification } from "../utils/sendMail";
import { Timestamp } from "firebase-admin/firestore";
import { formatFirestoreDate } from "../utils/dateUtils";

class SubscriptionService {
  private subscriptionsRef = firestore.collection("subscriptions");
  private usersRef = firestore.collection("users");

  private convertToFirestore(
    subscription: Subscription
  ): FirestoreSubscription {
    return {
      ...subscription,
      dateDebut: Timestamp.fromDate(subscription.dateDebut),
      dateFin: Timestamp.fromDate(subscription.dateFin),
      prochainPaiement: subscription.prochainPaiement as any, // Déjà un FirestoreTimestamp
      createdAt: Timestamp.fromDate(subscription.createdAt),
      updatedAt: Timestamp.fromDate(subscription.updatedAt),
      historiquePayments: subscription.historiquePayments.map((payment) => ({
        ...payment,
        datePaiement: Timestamp.fromDate(payment.datePaiement),
      })),
    };
  }

  private convertFromFirestore(
    firestoreData: FirestoreSubscription
  ): Subscription {
    return {
      ...firestoreData,
      dateDebut: firestoreData.dateDebut.toDate(),
      dateFin: firestoreData.dateFin.toDate(),
      prochainPaiement: firestoreData.prochainPaiement as any, // Garder comme FirestoreTimestamp
      createdAt: firestoreData.createdAt.toDate(),
      updatedAt: firestoreData.updatedAt.toDate(),
      historiquePayments: firestoreData.historiquePayments.map((payment) => ({
        ...payment,
        datePaiement: payment.datePaiement.toDate(),
      })),
    };
  }

  async createSubscription(
    userId: string,
    specialty: string,
    montantMensuel: number
  ): Promise<Subscription> {
    try {
      const userDoc = await this.usersRef.doc(userId).get();
      if (!userDoc.exists) {
        throw new ApiError(404, "Utilisateur non trouvé");
      }

      const userData = userDoc.data()!;
      if (
        userData.approvalStatus !== "approved" ||
        userData.paymentStatus !== "approved"
      ) {
        throw new ApiError(
          400,
          "L'utilisateur doit être approuvé pour créer un abonnement"
        );
      }

      const maintenant = new Date();
      const prochainPaiementDate = new Date();
      prochainPaiementDate.setMonth(prochainPaiementDate.getMonth() + 1);

      const prochainPaiement = {
        _seconds: Math.floor(prochainPaiementDate.getTime() / 1000),
        _nanoseconds: (prochainPaiementDate.getTime() % 1000) * 1000000,
      };

      const dateFin = new Date();
      dateFin.setFullYear(dateFin.getFullYear() + 1);

      const subscription: Subscription = {
        id: `SUB-${Math.random().toString(36).substring(2, 15)}`,
        userId,
        specialty,
        status: "actif" as SubscriptionStatus,
        montantMensuel,
        dateDebut: maintenant,
        dateFin,
        prochainPaiement,
        historiquePayments: [],
        createdAt: maintenant,
        updatedAt: maintenant,
      };

      const firestoreSubscription = this.convertToFirestore(subscription);
      await this.subscriptionsRef
        .doc(subscription.id)
        .set(firestoreSubscription);

      await sendMailNotification({
        from: "NEHONIX Academy",
        to: userData.email,
        subject: "Bienvenue à NEHONIX Academy - Votre abonnement est activé",
        message: `
Cher(e) ${userData.name},

Votre abonnement à NEHONIX Academy a été activé avec succès !

Détails de votre abonnement :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Formation : ${specialty}
• Montant mensuel : ${montantMensuel} FCFA
• Date de début : ${maintenant.toLocaleDateString()}
• Prochain paiement : ${prochainPaiementDate.toLocaleDateString()}

Important :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Votre abonnement sera automatiquement renouvelé chaque mois
• Assurez-vous d'avoir les fonds nécessaires avant la date de renouvellement
• En cas de problème, contactez notre support : support@nehonix.com

Nous sommes ravis de vous accompagner dans votre formation professionnelle !

Cordialement,
L'équipe NEHONIX Academy
        `,
      });

      return subscription;
    } catch (error) {
      //console.error("Erreur lors de la création de l'abonnement:", error);
      throw error;
    }
  }

  async checkSubscriptionStatus(subscriptionId: string): Promise<Subscription> {
    const subscriptionDoc = await this.subscriptionsRef
      .doc(subscriptionId)
      .get();
    if (!subscriptionDoc.exists) {
      throw new ApiError(404, "Abonnement non trouvé");
    }

    return this.convertFromFirestore(
      subscriptionDoc.data() as FirestoreSubscription
    );
  }

  async updatePaymentStatus(
    subscriptionId: string,
    paymentRef: string,
    success: boolean
  ) {
    try {
      const subscription = await this.checkSubscriptionStatus(subscriptionId);
      const maintenant = new Date();

      if (success) {
        const prochainPaiementDate = new Date();
        prochainPaiementDate.setMonth(prochainPaiementDate.getMonth() + 1);

        const prochainPaiement = {
          _seconds: Math.floor(prochainPaiementDate.getTime() / 1000),
          _nanoseconds: (prochainPaiementDate.getTime() % 1000) * 1000000,
        };

        await this.subscriptionsRef.doc(subscriptionId).update({
          prochainPaiement: Timestamp.fromDate(prochainPaiementDate),
          status: "actif",
          updatedAt: Timestamp.fromDate(maintenant),
          historiquePayments: [
            ...subscription.historiquePayments,
            {
              paymentRef,
              montant: subscription.montantMensuel,
              datePaiement: Timestamp.fromDate(maintenant),
              status: "reussi",
              methode: "orange",
            },
          ],
        });
      } else {
        await this.subscriptionsRef.doc(subscriptionId).update({
          status: "inactif",
          updatedAt: Timestamp.fromDate(maintenant),
          historiquePayments: [
            ...subscription.historiquePayments,
            {
              paymentRef,
              montant: subscription.montantMensuel,
              datePaiement: Timestamp.fromDate(maintenant),
              status: "echoue",
              methode: "orange",
            },
          ],
        });

        const user = await this.usersRef.doc(subscription.userId).get();
        const userData = user.data()!;

        await sendMailNotification({
          from: "NEHONIX Academy",
          to: userData.email,
          subject: "Action requise - Échec du paiement de votre abonnement",
          message: `
Cher(e) ${userData.name},

Le paiement de votre abonnement NEHONIX Academy n'a pas pu être effectué.

Détails :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Formation : ${subscription.specialty}
• Montant : ${subscription.montantMensuel} FCFA
• Date de la tentative : ${maintenant.toLocaleDateString()}

Pour réactiver votre accès :
1. Connectez-vous à votre compte NEHONIX
2. Accédez à la section "Mon abonnement"
3. Cliquez sur "Payer maintenant"

Si vous rencontrez des difficultés, notre équipe support est là pour vous aider.

Cordialement,
L'équipe NEHONIX Academy
          `,
        });
      }
    } catch (error) {
      //console.error("Erreur lors de la mise à jour du statut de paiement:", error);
      throw error;
    }
  }

  async getActiveSubscriptions(): Promise<Subscription[]> {
    const snapshot = await this.subscriptionsRef
      .where("status", "==", "actif")
      .get();

    return snapshot.docs.map((doc) =>
      this.convertFromFirestore(doc.data() as FirestoreSubscription)
    );
  }

  async checkExpiredSubscriptions() {
    const maintenant = new Date();
    const subscriptions = await this.getActiveSubscriptions();

    for (const subscription of subscriptions) {
      const prochainPaiementDate = formatFirestoreDate(
        subscription.prochainPaiement
      );

      if (prochainPaiementDate < maintenant) {
        await this.subscriptionsRef.doc(subscription.id).update({
          status: "inactif",
          updatedAt: Timestamp.fromDate(maintenant),
        });

        const user = await this.usersRef.doc(subscription.userId).get();
        const userData = user.data()!;

        await sendMailNotification({
          from: "NEHONIX Academy",
          to: userData.email,
          subject: "Important - Votre abonnement NEHONIX Academy a expiré",
          message: `
Cher(e) ${userData.name},

Votre abonnement NEHONIX Academy a expiré.

Pour continuer à accéder à votre formation, veuillez renouveler votre abonnement :
1. Connectez-vous à votre compte NEHONIX
2. Accédez à la section "Mon abonnement"
3. Cliquez sur "Renouveler maintenant"

Montant à payer : ${subscription.montantMensuel} FCFA

Si vous avez des questions, n'hésitez pas à contacter notre support.

Cordialement,
L'équipe NEHONIX Academy
          `,
        });
      }
    }
  }
}

export const subscriptionService = new SubscriptionService();
