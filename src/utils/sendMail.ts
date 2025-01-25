import nodeMailer from "nodemailer";
import { SERVER_ASSETS } from "./assets/server_assets";
import { IUser } from "../types/model";
import { getTemplate } from "./lib/getTemplate.lib";
import { nodemailerTransport as transport } from "./client/mail.transport";

export const sendWelcomeEmail = async (user: IUser) => {
  const template = getTemplate("welcome-registration");
  const htmlContent = template({
    logoUrl: SERVER_ASSETS.nehonix.LOGO,
    from: "NEHONIX",
    username: user.name,
    matricule: user.matricule,
    email: user.email,
    specialty: user.specialty,
    phone: user.phone,
  });

  try {
    await transport.sendMail({
      from: '"NEHONIX" <nehonixspace@gmail.com>',
      to: user.email,
      subject:
        "Bienvenue sur NXSAH (NEHONIX Student Hub) - Confirmation d'inscription",
      html: htmlContent,
    });
    //console.log("Email de bienvenue envoyé avec succès");
  } catch (error) {
    //console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
    throw error;
  }
};

export const sendLoginNotificationEmail = async (
  user: any,
  deviceInfo: {
    browser: { name?: string; version?: string };
    os: { name?: string; version?: string };
  },
  ip: string,
  from = "NEHONIX"
) => {
  const template = getTemplate("login-notification");
  const htmlContent = template({
    logoUrl: SERVER_ASSETS.nehonix.LOGO,
    from,
    username: user.name,
    loginDate: new Date().toLocaleString("fr-FR", { timeZone: "UTC" }),
    browser: `${deviceInfo.browser.name || "Inconnu"} ${
      deviceInfo.browser.version || ""
    }`,
    os: `${deviceInfo.os.name || "Inconnu"} ${deviceInfo.os.version || ""}`,
    ip,
  });

  try {
    await transport.sendMail({
      from: `"${from}" <nehonixspace@gmail.com>`,
      to: user.email,
      subject: "NXSAH - Notification de connexion",
      html: htmlContent,
    });
    //console.log("Email de notification de connexion envoyé avec succès");
  } catch (error) {
    //console.error("Erreur lors de l'envoi de l'email de notification:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  username: string,
  resetLink: string
) => {
  const template = getTemplate("reset-password");
  const htmlContent = template({
    logoUrl: SERVER_ASSETS.nehonix.LOGO,
    from: "NEHONIX",
    username,
    resetLink,
    expirationTime: 24,
  });

  try {
    await transport.sendMail({
      from: '"NEHONIX" <nehonixspace@gmail.com>',
      to,
      subject: "Réinitialisation de votre mot de passe",
      html: htmlContent,
    });
    //console.log("Email de réinitialisation envoyé avec succès");
  } catch (error) {
    //console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

// export const sendEmail = async () => {
//   return await sendPasswordResetEmail(
//     "cyberellibou@gmail.com",
//     "John Doe",
//     "https://votre-site.com/reset-password?token=xyz123"
//   );
// };

interface SendMailT {
  from: string;
  to: string;
  subject: string;
  title?: string;
  message?: string;
  actionUrl?: string;
  actionText?: string;
  expirationTime?: number;
}

export const sendMailNotification = async ({
  from = "NEHONIX",
  to,
  subject,
  message,
  actionUrl,
  actionText,
  title,
  expirationTime = 24,
}: SendMailT) => {
  try {
    const template = getTemplate("email-notif");
    const htmlContent = template({
      logoUrl: SERVER_ASSETS.nehonix.LOGO,
      from,
      title,
      message,
      actionUrl,
      actionText,
      expirationTime,
    });

    await transport.sendMail({
      from: `"${from}" <nehonixspace@gmail.com>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    //console.log(`Email de notification envoyé avec succès à ${to}`);
  } catch (mailError: any) {
    //console.error("Erreur lors de l'envoi de l'email de notification:");
    /**
     * ,
      mailError?.message || mailError
     */
    throw mailError;
  }
};

export const testMail = async () => {
  return await sendMailNotification({
    from: "NEHONIX",
    to: "cyberellibou@gmail.com",
    subject: "Test de notification",
    message: "Ceci est un test de notification",
  });
};
