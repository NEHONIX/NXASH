import * as SibApiV3Sdk from "sib-api-v3-sdk";
import { BREVO_CONFIG } from "../../conf/brevo.config";

interface SendMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// Configuration du client Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = BREVO_CONFIG.API_KEY;

// Création de l'instance API pour les emails transactionnels
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const brevoTransport = {
  sendMail: async ({ from, to, subject, html }: SendMailOptions) => {
    //console.log('Préparation de l\'envoi d\'email via Brevo API...');

    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      // Configuration de l'expéditeur
      const fromName = from.includes("<")
        ? from.split("<")[0].trim().replace(/"/g, "")
        : "NEHONIX";
      const fromEmail = from.includes("<")
        ? from.split("<")[1].replace(">", "").trim()
        : "nehonixspace@gmail.com";

      sendSmtpEmail.sender = {
        name: fromName,
        email: fromEmail,
      };

      // Configuration des destinataires
      sendSmtpEmail.to = [
        {
          email: to,
          name: to.split("@")[0],
        },
      ];

      // Configuration du contenu
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;

      // console.log('Configuration de l\'email:', {
      //   sender: sendSmtpEmail.sender,
      //   to: sendSmtpEmail.to,
      //   subject: sendSmtpEmail.subject
      // });

      // Envoi de l'email
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      //console.log('Email envoyé avec succès:', result);
      return result;
    } catch (error: any) {
      // console.error('Erreur détaillée:', {
      //   message: error.message,
      //   code: error.code,
      //   response: error.response?.text,
      //   stack: error.stack
      // });
      throw error;
    }
  },
};
