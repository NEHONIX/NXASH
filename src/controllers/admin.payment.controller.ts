import { Request, Response, NextFunction } from "express";
import { firestore } from "../conf/firebase";
import ApiError from "../utils/ApiError";
import { sendMailNotification } from "../utils/sendMail";
import { AuthenticatedRequest } from "../types/custom";
import { log } from "console";

// Définition des types
type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "awaiting_orange_code"
  | "processing";

interface PaymentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  awaiting_orange_code: number;
  processing: number;
  totalAmount: number;
  todayAmount: number;
  weekAmount: number;
  monthAmount: number;
}

interface PaymentSession {
  status: PaymentStatus;
  amount: number;
  userId: string;
  studentEmail: string;
  updatedAt: FirebaseFirestore.Timestamp;
  [key: string]: any;
}

export class AdminPaymentController {
  // Récupérer toutes les sessions de paiement
  static async getAllPaymentSessions(
    req: AuthenticatedRequest & Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { status = "all", page = 1, limit = 10 } = req.query;

      let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
        firestore.collection("payment_sessions");

      // Si status n'est pas 'all', ajouter le filtre
      if (status !== "all") {
        query = query.where("status", "==", status);
      }

      // Ajouter le tri par date de création
      query = query.orderBy("createdAt", "desc");

      try {
        const snapshot = await query
          .limit(Number(limit))
          .offset((Number(page) - 1) * Number(limit))
          .get();

        const payments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        res.status(200).json({
          success: true,
          data: payments,
        });
      } catch (error: any) {
        // Vérifier si l'erreur est liée à l'index manquant
        if (error.code === 9 && error.details?.includes("index")) {
          // Retourner un message plus convivial avec le lien pour créer l'index
          const indexUrl = error.details.match(/https:\/\/[^\s]+/)[0];
          throw new ApiError(
            400,
            `Pour utiliser les filtres et le tri, vous devez d'abord créer un index dans Firebase. 
            Veuillez cliquer sur ce lien pour le créer : ${indexUrl}
            
            Une fois l'index créé, réessayez votre requête.`
          );
        }
        throw error;
      }
    } catch (error) {
      log(error);
      next(error);
    }
  }

  // Récupérer une session de paiement spécifique
  static async getPaymentSession(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { paymentRef } = req.params;

      const paymentDoc = await firestore
        .collection("payment_sessions")
        .doc(paymentRef)
        .get();

      if (!paymentDoc.exists) {
        throw new ApiError(404, "Session de paiement non trouvée");
      }

      res.status(200).json({
        success: true,
        data: {
          id: paymentDoc.id,
          ...paymentDoc.data(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Mettre à jour le statut d'une session de paiement
  static async updatePaymentStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { paymentRef } = req.params;
      const { status, adminNote } = req.body;

      // log(status, adminNote);
      if (
        ![
          "pending",
          "approved",
          "rejected",
          "awaiting_orange_code",
          "processing",
        ].includes(status)
      ) {
        log("status", status);
        throw new ApiError(400, "Statut invalide");
      }

      const paymentDoc = await firestore
        .collection("payment_sessions")
        .doc(paymentRef)
        .get();

      if (!paymentDoc.exists) {
        throw new ApiError(404, "Session de paiement non trouvée");
      }

      const paymentData = paymentDoc.data();

      // Mettre à jour le statut
      await firestore.collection("payment_sessions").doc(paymentRef).update({
        status,
        adminNote,
        updatedAt: new Date(),
        processedBy: req.user.uid, // Ajouté par le middleware d'authentification
      });

      // Si le paiement est approuvé, mettre à jour le statut de l'utilisateur
      if (status === "approved") {
        await firestore.collection("users").doc(paymentData?.userId).update({
          paymentStatus: "approved",
          approvalStatus: "approved",
          updatedAt: new Date(),
        });

        // Envoyer un email de confirmation à l'étudiant
        await sendMailNotification({
          from: "NXSAH Payment",
          to: paymentData?.studentEmail,
          subject: "Paiement confirmé - NXSAH",
          message: `
            Votre paiement a été confirmé avec succès.
            Référence: ${paymentRef}
            Montant: ${paymentData?.amount} FCFA
            
            Vous pouvez maintenant accéder à tous les services de la plateforme.
          `,
        });
      }

      // Si le paiement est rejeté, envoyer un email d'explication
      if (status === "rejected") {
        await sendMailNotification({
          from: "NXSAH Payment",
          to: paymentData?.studentEmail,
          subject: "Paiement non validé - NXSAH",
          message: `
            Votre paiement n'a pas pu être validé.
            Référence: ${paymentRef}
            Montant: ${paymentData?.amount} FCFA
            
            Raison: ${
              adminNote ||
              "Veuillez contacter le support pour plus d'informations"
            }
            
            Vous pouvez réessayer ou contacter notre support pour assistance.
          `,
        });
      }

      res.status(200).json({
        success: true,
        message: `Statut de paiement mis à jour : ${status}`,
        data: {
          paymentRef,
          status,
          adminNote,
        },
      });
    } catch (error) {
      //console.log(error);

      next(error);
    }
  }

  // Obtenir les statistiques des paiements
  static async getPaymentStats(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const stats: PaymentStats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        awaiting_orange_code: 0,
        processing: 0,
        totalAmount: 0,
        todayAmount: 0,
        weekAmount: 0,
        monthAmount: 0,
      };

      // Récupérer toutes les sessions de paiement
      const snapshot = await firestore.collection("payment_sessions").get();

      // Dates de référence
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Début de la semaine (Dimanche)

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1); // Début du mois

      snapshot.forEach((doc) => {
        const data = doc.data() as PaymentSession;
        stats.total++;

        // Incrémenter le compteur pour le statut correspondant
        switch (data.status) {
          case "pending":
            stats.pending++;
            break;
          case "approved":
            stats.approved++;
            // Calculer les montants pour différentes périodes
            if (data.amount) {
              stats.totalAmount += data.amount;

              const paymentDate = data.updatedAt.toDate();
              if (paymentDate >= today) {
                stats.todayAmount += data.amount;
              }
              if (paymentDate >= weekStart) {
                stats.weekAmount += data.amount;
              }
              if (paymentDate >= monthStart) {
                stats.monthAmount += data.amount;
              }
            }
            break;
          case "rejected":
            stats.rejected++;
            break;
          case "awaiting_orange_code":
            stats.awaiting_orange_code++;
            break;
          case "processing":
            stats.processing++;
            break;
        }
      });

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
