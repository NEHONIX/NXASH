import { Request, Response, NextFunction } from "express";
import { firestore } from "../conf/firebase";
import ApiError from "../utils/ApiError";
import { decodeToken } from "../utils/jwt.utils";
import { ITokenPayload } from "../types/model";
import { IPaymentSession, PaymentStatus } from "../types/payment";
import { paymentService } from "../services/payment.service";
import { subscriptionService } from "../services/subscription.service";
import { paymentStatsService } from "../services/payment.stats.service";
import { notificationService } from "../services/notification.service";

export class PaymentController {
  private static async createOrUpdateSubscription(
    paymentData: IPaymentSession,
    paymentRef: string
  ): Promise<{ success: boolean; subscriptionId?: string }> {
    try {
      // Vérifier si un abonnement existe déjà
      const existingSubscriptions = await firestore
        .collection("subscriptions")
        .where("userId", "==", paymentData.userId)
        .where("status", "==", "actif")
        .get();

      if (!existingSubscriptions.empty) {
        // Mise à jour de l'abonnement existant
        const subscription = existingSubscriptions.docs[0];
        await subscriptionService.updatePaymentStatus(
          subscription.id,
          paymentRef,
          true
        );
        return { success: true, subscriptionId: subscription.id };
      } else {
        // Création d'un nouvel abonnement
        const subscription = await subscriptionService.createSubscription(
          paymentData.userId,
          paymentData.specialty,
          paymentData.amount
        );

        // Mise à jour de la session de paiement
        await firestore.collection("payment_sessions").doc(paymentRef).update({
          subscriptionId: subscription.id,
          updatedAt: new Date(),
        });

        return { success: true, subscriptionId: subscription.id };
      }
    } catch (error) {
      //console.error("Erreur lors de la gestion de l'abonnement:", error);
      return { success: false };
    }
  }

  private static async updateUserStatus(userId: string) {
    await firestore.collection("users").doc(userId).update({
      subscriptionStatus: "actif",
      lastPaymentDate: new Date(),
      updatedAt: new Date(),
    });
  }

  static async initializePayment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { paymentToken, paymentData } = req.body;
      const { amount, paymentPhoneNumber, paymentMethod } = paymentData;

      if (paymentMethod === "orange" && !paymentPhoneNumber) {
        throw new ApiError(400, "Veuillez fournir votre numéro Orange Money");
      }

      const decodedTokenData = await decodeToken(paymentToken);
      if (typeof decodedTokenData === "string") {
        throw new ApiError(400, "Token invalide");
      }

      const userData = decodedTokenData as ITokenPayload;
      const paymentRef = `PAY-${Math.random().toString(36).substring(2, 15)}`;

      // //console.log(userData);
      const user = firestore.collection("users").doc(userData.uid);
      const { specialty = "none", name } = (await user.get()).data()!;

      if (!user) throw new ApiError(404, "Utilisateur non trouvé!");

      if (specialty === "none")
        throw new ApiError(404, "Spécialisation non trouvée!");

      const paymentSession = {
        paymentRef,
        userId: userData.uid,
        studentEmail: userData.email,
        studentPhone: userData.phone,
        paymentPhoneNumber,
        paymentMethod,
        status: paymentMethod === "orange" ? "awaiting_orange_code" : "pending",
        amount,
        specialty,
        createdAt: new Date(),
        updatedAt: new Date(),
        deviceInfo: userData.deviceInfo || "Inconnu",
        adminProcessing: false,
      };

      await firestore
        .collection("payment_sessions")
        .doc(paymentRef)
        .set(paymentSession);

      // Envoyer les notifications
      await notificationService.sendPaymentInitiatedNotification(
        {
          name,
          paymentRef,
          amount,
          specialty,
          paymentPhoneNumber,
          email: userData.email,
        },
        paymentMethod
      );

      const instructions =
        paymentMethod === "orange"
          ? "Validez la transaction sur votre téléphone et entrez le code reçu"
          : `Notre service client ${paymentMethod.toUpperCase()} va vous contacter`;

      res.status(200).json({
        success: true,
        message: "Demande de paiement initialisée avec succès",
        data: { paymentRef, status: paymentSession.status, instructions },
      });
    } catch (error) {
      //console.log(error);
      next(error);
    }
  }

  static async submitOrangeCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { paymentRef, verificationCode: orangeCode } = req.body;

      if (!orangeCode) {
        throw new ApiError(400, "Le code Orange est requis");
      }

      const paymentDoc = await firestore
        .collection("payment_sessions")
        .doc(paymentRef)
        .get();

      if (!paymentDoc.exists) {
        throw new ApiError(404, "Session de paiement non trouvée");
      }

      const paymentData = paymentDoc.data()!;

      if (paymentData.status !== "awaiting_orange_code") {
        throw new ApiError(400, "Cette session n'attend pas de code Orange");
      }

      await firestore.collection("payment_sessions").doc(paymentRef).update({
        orangeCode,
        status: "processing",
        updatedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Code Orange soumis avec succès",
        data: {
          status: "processing",
          instructions: "Code reçu. Vérification du paiement en cours.",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkPaymentStatus(
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

      const paymentData = paymentDoc.data()! as IPaymentSession;
      let activationSuccess = false;

      //Si le status de la transaction est approuvée
      if (paymentData.status === "approved") {
        try {
          const { success, subscriptionId } =
            await PaymentController.createOrUpdateSubscription(
              paymentData,
              paymentRef
            );

          if (success) {
            activationSuccess = true;

            //Si l'id est présent
            if (subscriptionId) {
              await firestore
                .collection("payment_sessions")
                .doc(paymentRef)
                .update({
                  subscriptionActivated: true,
                  updatedAt: new Date(),
                });
            }

            //Avoir les infos de l'user
            const userRef = firestore
              .collection("users")
              .doc(paymentData.userId);
            const userData = (await userRef.get()).data()!;

            // Traiter le parrainage si l'utilisateur a un code
            if (
              userData.referal?.code &&
              userData.referal.status !== "approved"
            ) {
              // Chercher le document du parrain par son code
              const referalSnapshot = await firestore
                .collection("referals")
                .where("referalCode", "==", userData.referal.code)
                .limit(1)
                .get();

              if (!referalSnapshot.empty && userData.referal !== "approved") {
                const referalDoc = referalSnapshot.docs[0];
                const referalData = referalDoc.data();

                // Mettre à jour le document de parrainage
                await referalDoc.ref.update({
                  registeredReferals: [
                    ...referalData.registeredReferals,
                    paymentData.userId,
                  ],
                  totalReferals: referalData.totalReferals + 1,
                  updatedAt: new Date(),
                });

                // Mettre à jour le statut du parrainage de l'utilisateur
                await userRef.update({
                  "referal.status": "approved",
                  updatedAt: new Date(),
                });
              }
            }

            await PaymentController.updateUserStatus(paymentData.userId);
            await paymentStatsService.updatePaymentStats(paymentData, true);

            await notificationService.sendSubscriptionActivatedNotification(
              {
                name: userData.name,
                paymentRef,
                amount: paymentData.amount,
                specialty: userData.specialty,
                email: userData.email,
                subscriptionId: subscriptionId,
              },
              !!subscriptionId
            );
          }
        } catch (error: any) {
          //console.error("Erreur d'activation:", error);

          activationSuccess = false;
          await notificationService.sendActivationErrorNotification({
            paymentRef,
            amount: paymentData.amount,
            // specialty: paymentData.specialty,
            email: paymentData.studentEmail,
            error,
          });
        }
      }

      const data = {
        status: paymentData.status,
        updatedAt: paymentData.updatedAt,
        message: paymentData.adminNote,
        paymentRef: paymentData.paymentRef,
        processedBy: paymentData.processedBy,
        userId: paymentData.userId,
        subscriptionId: paymentData.subscriptionId,
        subscriptionStatus:
          paymentData.status === "approved" ? "actif" : "en_attente",
        montantMensuel: paymentData.amount,
        activationSuccess,
      };

      res.status(200).json({
        success: true,
        data,
        message: activationSuccess
          ? "Paiement validé et abonnement activé avec succès"
          : paymentData.status === "approved"
          ? "Paiement validé mais erreur lors de l'activation"
          : "Paiement en cours de traitement",
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOrangeCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { paymentRef, verificationCode } = req.body;
      const paymentDoc = await firestore
        .collection("payment_sessions")
        .doc(paymentRef)
        .get();

      if (!paymentDoc.exists) {
        throw new ApiError(404, "Session de paiement non trouvée");
      }

      const paymentData = paymentDoc.data()!;

      if (paymentData?.paymentMethod !== "orange") {
        throw new ApiError(400, "Cette session n'est pas un paiement Orange");
      }

      if (paymentData?.verificationCode !== verificationCode) {
        throw new ApiError(400, "Code de vérification incorrect");
      }

      await firestore.collection("payment_sessions").doc(paymentRef).update({
        codeVerified: true,
        status: "success",
        updatedAt: new Date(),
      });

      // const { success, subscriptionId } =
      //   await PaymentController.createOrUpdateSubscription(
      //     paymentData,
      //     paymentRef
      //   );

      // if (success && subscriptionId) {
      //   await firestore.collection("payment_sessions").doc(paymentRef).update({
      //     subscriptionId,
      //     subscriptionActivated: true,
      //   });
      // }

      await notificationService.sendPaymentValidatedNotification({
        paymentRef,
        amount: paymentData.amount,
        specialty: paymentData.specialty,
        email: paymentData.studentEmail,
        paymentPhoneNumber: paymentData.paymentPhoneNumber,
        subscriptionId: paymentData.subscriptionId,
      });

      res.status(200).json({
        success: true,
        message: "Paiement validé avec succès",
        data: {
          paymentRef,
          status: "success",
          message: "Paiement validé. Abonnement activé avec succès.",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      await paymentService.handleWebhook(req.body);
      res.status(200).json({
        success: true,
        message: "Webhook traité avec succès",
      });
    } catch (error) {
      next(error);
    }
  }

  // static async getPaymentStatus(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   try {
  //     const session = await paymentService.getPaymentSession(
  //       req.params.sessionId
  //     );
  //     res.status(200).json({
  //       success: true,
  //       message: "Statut récupéré avec succès",
  //       data: {
  //         status: session.status,
  //         amount: session.amount,
  //         currency: session.currency,
  //         specialty: session.specialty,
  //         createdAt: session.createdAt,
  //         expiresAt: session.expiresAt,
  //       },
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}
