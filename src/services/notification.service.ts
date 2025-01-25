import { sendMailNotification } from "../utils/sendMail";

interface NotificationData {
  name?: string;
  paymentRef: string;
  amount: number;
  specialty?: string;
  paymentPhoneNumber?: string;
  email: string;
  subscriptionId?: string;
  error?: any;
}

class NotificationService {
  private readonly ADMIN_EMAIL = "nehonix@proton.me";
  private readonly SYSTEM_NAME = "NEHONIX Academy Student Hubs (NXASH)";
  private readonly SUPPORT_EMAIL = "support@nehonix.space";

  async sendPaymentInitiatedNotification(
    data: NotificationData,
    paymentMethod: string
  ) {
    const subject = `Nouvelle demande de paiement ${paymentMethod.toUpperCase()} - ${
      data.paymentRef
    }`;
    const message = this.generatePaymentInitiatedMessage(data, paymentMethod);

    // //console.log("data :", data);

    await this.sendToAdmin(subject, message);
    await this.sendToClient(
      `Confirmation de votre demande de paiement ${paymentMethod} - ${this.SYSTEM_NAME}`,
      this.generateClientInitiationMessage(data, paymentMethod),
      data.email
    );
  }

  async sendSubscriptionActivatedNotification(
    data: NotificationData,
    isRenewal: boolean
  ) {
    const subject = isRenewal
      ? `Renouvellement réussi - ${this.SYSTEM_NAME}`
      : `Bienvenue à ${this.SYSTEM_NAME} - Activation réussie`;

    await this.sendToClient(
      subject,
      this.generateSubscriptionMessage(data, isRenewal),
      data.email
    );
  }

  async sendActivationErrorNotification(data: NotificationData) {
    const subject = `ERREUR - Échec d'activation - ${data.paymentRef}`;
    const message = this.generateErrorMessage(data);
    await this.sendToAdmin(subject, message);
  }

  async sendPaymentValidatedNotification(data: NotificationData) {
    const subject = `Paiement validé - ${data.paymentRef}`;
    const message = this.generatePaymentValidatedMessage(data);
    await this.sendToAdmin(subject, message);
  }

  private async sendToAdmin(subject: string, message: string) {
    await sendMailNotification({
      from: this.SYSTEM_NAME,
      to: this.ADMIN_EMAIL,
      subject,
      message,
    });
  }

  private async sendToClient(subject: string, message: string, to: string) {
    await sendMailNotification({
      from: this.SYSTEM_NAME,
      to,
      subject,
      message,
    });
  }

  private generatePaymentInitiatedMessage(
    data: NotificationData,
    paymentMethod: string
  ): string {
    return `
    Nouvelle demande de paiement ${paymentMethod.toUpperCase()} : \n
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n
    • Référence : ${data.paymentRef} \n
    • Montant : ${data.amount} FCFA \n
    • Formation : ${data.specialty} \n
    • Client : ${data.name} \n
    • Email : ${data.email} \n
    • Telephone : ${data.paymentPhoneNumber} \n

    Actions requises : \n
    1. Vérifier les informations \n
    2. Contacter le client \n
    3. Valider le paiement \n
    `;
  }

  private generateClientInitiationMessage(
    data: NotificationData,
    paymentMethod: string
  ): string {
    return `
Cher(e) ${data.name},

Votre demande de paiement a été enregistrée avec succès.

Détails de la transaction :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Référence : ${data.paymentRef}
• Montant : ${data.amount} FCFA
• Formation : ${data.specialty}
• Méthode : ${paymentMethod.toUpperCase()}

Prochaines étapes :
1. ${this.getPaymentMethodInstructions(paymentMethod)}
2. Attendez la confirmation par email
3. Accédez à votre espace étudiant

Pour toute question, contactez notre support : ${this.SUPPORT_EMAIL}

Cordialement,
L'équipe ${this.SYSTEM_NAME}
    `;
  }

  private generateSubscriptionMessage(
    data: NotificationData,
    isRenewal: boolean
  ): string {
    return `
Cher(e) ${data.name},

${
  isRenewal
    ? "Votre abonnement a été renouvelé avec succès !"
    : "Votre abonnement a été activé avec succès ! Bienvenue dans la communauté NEHONIX Academy."
}

Détails de votre abonnement :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Formation : ${data.specialty}
• Montant mensuel : ${data.amount} FCFA
• Date de paiement : ${new Date().toLocaleDateString()}
• Statut : Actif

Prochaines étapes :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Connectez-vous à votre espace étudiant
2. Complétez votre profil
3. Accédez à vos cours
4. Rejoignez notre communauté sur Discord

Important :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Votre prochain paiement sera automatiquement prélevé dans un mois
• Gardez votre numéro de téléphone à jour pour les paiements
• Pour toute question, contactez notre support : ${this.SUPPORT_EMAIL}

Cordialement,
L'équipe ${this.SYSTEM_NAME}
    `;
  }

  private generateErrorMessage(data: NotificationData): string {
    return `
Erreur lors de l'activation de l'abonnement :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Référence : ${data.paymentRef}
• Utilisateur : ${data.email}
• Formation : ${data.specialty}
• Erreur : ${data.error?.message || "Erreur inconnue"}

Actions requises :
1. Vérifier les logs
2. Contacter l'étudiant
3. Activer manuellement si nécessaire
    `;
  }

  private generatePaymentValidatedMessage(data: NotificationData): string {
    return `
Le paiement a été validé :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Référence : ${data.paymentRef}
• Montant : ${data.amount} FCFA
• Email : ${data.email}
• Formation : ${data.specialty}
• Téléphone : ${data.paymentPhoneNumber}

L'abonnement a été ${data.subscriptionId ? "renouvelé" : "créé"} avec succès.
    `;
  }

  private getPaymentMethodInstructions(method: string): string {
    switch (method.toLowerCase()) {
      case "orange":
        return "Validez la transaction sur votre téléphone Orange Money";
      case "mtn":
        return "Attendez l'appel de notre service client MTN MoMo";
      case "moov":
        return "Attendez l'appel de notre service client Moov Money";
      default:
        return "Suivez les instructions de paiement";
    }
  }
}

export const notificationService = new NotificationService();
