import { Response, NextFunction } from "express";
import { firestore } from "../conf/firebase";
import ApiError from "../utils/ApiError";
import { sendMailNotification } from "../utils/sendMail";
import { AuthenticatedRequest as Request } from "../types/auth";
import { REFERAL_REWARDS, ReferalReward } from "../types/referal";
import { Timestamp } from "firebase-admin/firestore";

export class ReferalController {
  /**
   * Inviter des amis par email
   */
  static async inviteFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const { emails } = req.body;
      const studentId = req.user?.uid;

      if (!Array.isArray(emails) || emails.length === 0) {
        throw new ApiError(400, "Veuillez fournir au moins une adresse email");
      }

      // Récupérer les informations de l'étudiant
      const studentDoc = await firestore
        .collection("users")
        .doc(studentId)
        .get();
      if (!studentDoc.exists) {
        throw new ApiError(404, "Étudiant non trouvé");
      }

      const student = studentDoc.data()!;
      const referalCode = `INV.${studentId.substring(0, 6)}`;

      // Créer ou mettre à jour le document de parrainage
      const referalDoc = await firestore
        .collection("referals")
        .doc(studentId)
        .get();

      if (!referalDoc.exists) {
        await firestore.collection("referals").doc(studentId).set({
          studentId,
          referalCode,
          invitedEmails: emails,
          registeredReferals: [],
          totalReferals: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Ajouter uniquement les nouveaux emails
        const existingData = referalDoc.data()!;
        const newEmails = emails.filter(
          (email) => !existingData.invitedEmails.includes(email)
        );

        await firestore
          .collection("referals")
          .doc(studentId)
          .update({
            invitedEmails: [...existingData.invitedEmails, ...newEmails],
            updatedAt: new Date(),
          });
      }

      // Envoyer les emails d'invitation
      for (const email of emails) {
        await sendMailNotification({
          from: "NEHONIX Academy",
          to: email,
          subject: `${student.name} vous invite à rejoindre NEHONIX Academy`,
          message: referalMessage({ referalCode, student }),
          actionUrl: `${process.env.FRONTEND_URL}/register?invite=${referalCode}`,
          actionText: "Je m'inscris",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Invitations envoyées avec succès",
        data: {
          referalCode,
          invitedCount: emails.length,
        },
      });
    } catch (error) {
      //console.log(error);
      next(error);
    }
  }

  /**
   * Obtenir les statistiques de parrainage
   */
  static async getReferalStats(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const studentId = req.user?.uid;
      // //console.log("users", req.user);

      if (!studentId) throw new ApiError(404, "Aucun étudiant trouvé");
      const referalDoc = await firestore
        .collection("referals")
        .doc(studentId)
        .get();
      if (!referalDoc.exists) {
        return res.status(200).json({
          status: "success",
          data: {
            referalCode: `INV.${studentId.substring(0, 6)}`,
            invitedCount: 0,
            registeredCount: 0,
            totalReferals: 0,
          },
        });
      }

      const referalData = referalDoc.data()!;

      res.status(200).json({
        status: "success",
        data: {
          referalCode: referalData.referalCode,
          invitedCount: referalData.invitedEmails.length,
          registeredCount: referalData.registeredReferals.length,
          totalReferals: referalData.totalReferals,
        },
      });
    } catch (error) {
      //console.log(error);
      next(error);
    }
  }

  /**
   * Obtenir l'historique des parrainages
   */
  static async getReferalHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const studentId = req.user?.uid;
      const referalDoc = await firestore
        .collection("referals")
        .doc(studentId)
        .get();

      if (!referalDoc.exists) {
        return res.status(200).json({
          status: "success",
          data: {
            invitedEmails: [],
            registeredReferals: [],
          },
        });
      }

      const referalData = referalDoc.data()!;

      // Récupérer les détails des filleuls inscrits
      const registeredUsers = await Promise.all(
        referalData.registeredReferals.map(async (userId: string) => {
          const userDoc = await firestore.collection("users").doc(userId).get();
          const userData = userDoc.data()!;
          return {
            id: userId,
            name: userData.name,
            email: userData.email,
            registeredAt: userData.createdAt,
          };
        })
      );

      res.status(200).json({
        status: "success",
        data: {
          invitedEmails: referalData.invitedEmails,
          registeredReferals: registeredUsers,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtenir les récompenses disponibles et débloquées
   */
  static async getReferalRewards(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const studentId = req.user?.uid;
      const referalDoc = await firestore
        .collection("referals")
        .doc(studentId)
        .get();

      if (!referalDoc.exists) {
        return res.status(200).json({
          status: "success",
          data: {
            availableRewards: REFERAL_REWARDS,
            unlockedRewards: [],
            claimedRewards: [],
          },
        });
      }

      const referalData = referalDoc.data()!;
      const totalReferals = referalData.registeredReferals.length;

      // Filtrer les récompenses débloquées
      const unlockedRewards = REFERAL_REWARDS.filter(
        (reward) => totalReferals >= reward.minReferals
      );

      // Récupérer les récompenses déjà réclamées
      const claimedRewards = referalData.claimedRewards || [];

      res.status(200).json({
        status: "success",
        data: {
          availableRewards: REFERAL_REWARDS,
          unlockedRewards: unlockedRewards.filter(
            (reward) => !claimedRewards.includes(reward.id)
          ),
          claimedRewards: unlockedRewards.filter((reward) =>
            claimedRewards.includes(reward.id)
          ),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Réclamer une récompense
   */
  static async claimReward(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.uid;
      const { rewardId } = req.params;

      // Vérifier si la récompense existe
      const reward = REFERAL_REWARDS.find((r) => r.id === rewardId);
      if (!reward) {
        throw new ApiError(404, "Récompense non trouvée");
      }

      const referalDoc = await firestore
        .collection("referals")
        .doc(studentId)
        .get();

      if (!referalDoc.exists) {
        throw new ApiError(400, "Aucun parrainage trouvé");
      }

      const referalData = referalDoc.data()!;
      const totalReferals = referalData.registeredReferals.length;

      // Vérifier si l'étudiant a assez de parrainages
      if (totalReferals < reward.minReferals) {
        throw new ApiError(
          400,
          `Il vous faut ${reward.minReferals} parrainages pour débloquer cette récompense`
        );
      }

      // Vérifier si la récompense n'a pas déjà été réclamée
      const claimedRewards = referalData.claimedRewards || [];
      if (claimedRewards.includes(rewardId)) {
        throw new ApiError(400, "Cette récompense a déjà été réclamée");
      }

      // Appliquer la récompense selon son type
      switch (reward.type) {
        case "discount":
          // Stocker la réduction pour le prochain paiement
          await firestore.collection("users").doc(studentId).update({
            nextPaymentDiscount: reward.value,
            updatedAt: new Date(),
          });
          break;

        case "bonus_days":
          // Récupérer l'abonnement actuel
          const subscriptionSnapshot = await firestore
            .collection("subscriptions")
            .where("userId", "==", studentId)
            .where("status", "in", ["actif", "inactif"])
            .limit(1)
            .get();

          if (!subscriptionSnapshot.empty) {
            const subscription = subscriptionSnapshot.docs[0].data();
            const prochainPaiement = subscription.prochainPaiement.toDate();
            prochainPaiement.setDate(prochainPaiement.getDate() + reward.value);

            await subscriptionSnapshot.docs[0].ref.update({
              prochainPaiement: Timestamp.fromDate(prochainPaiement),
              updatedAt: new Date(),
            });
          }
          break;

        case "special_access":
          // Ajouter l'accès spécial
          await firestore
            .collection("users")
            .doc(studentId)
            .update({
              specialAccess: true,
              specialAccessExpiry: new Date(
                Date.now() + reward.value * 24 * 60 * 60 * 1000
              ),
              updatedAt: new Date(),
            });
          break;
      }

      // Marquer la récompense comme réclamée
      await firestore
        .collection("referals")
        .doc(studentId)
        .update({
          claimedRewards: [...claimedRewards, rewardId],
          updatedAt: new Date(),
        });

      // Envoyer un email de confirmation
      const studentDoc = await firestore
        .collection("users")
        .doc(studentId)
        .get();
      const student = studentDoc.data()!;

      await sendMailNotification({
        from: "NEHONIX Academy",
        to: student.email,
        subject:
          "Félicitations ! Votre récompense de parrainage a été débloquée",
        message: `
Cher(e) ${student.name},

Félicitations ! Vous venez de débloquer une nouvelle récompense grâce à vos parrainages :
${reward.description}

Cette récompense a été automatiquement appliquée à votre compte.

Continuez à parrainer vos amis pour débloquer encore plus de récompenses !

L'équipe NEHONIX
        `,
      });

      res.status(200).json({
        status: "success",
        message: "Récompense réclamée avec succès",
        data: {
          reward,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

const referalMessage = ({
  student,
  referalCode,
}: {
  student: any;
  referalCode: string;
}) => {
  return `
Bonjour,

${student.name} pense que NEHONIX Academy pourrait vous interesser !

NEHONIX Academy est une plateforme de formation en ligne qui propose des cours de qualité dans différents domaines du développement web et mobile.

Pour vous inscrire et beneficiere d'avantages exclusifs :
Utilisez ce lien : ${process.env.FRONTEND_URL}/register?ref=${referalCode}

Avantages du parrainage :
- Reduction sur votre premier mois d'abonnement
- Acces a des ressources exclusives
- Support personnalisé

A très bientôt sur NEHONIX Academy Student Hub (NXASH) !

L'équipe NEHONIX
          `;
};
