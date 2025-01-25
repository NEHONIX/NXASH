import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, UserData } from "../types/auth";
import { Subscription } from "../types/subscription";
import ApiError from "../utils/ApiError";
import { firestore } from "../conf/firebase";
import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { formatFirestoreDate } from "../utils/dateUtils";
import { FORMATION_PRICES } from "../types/payment";

interface CourseData extends DocumentData {
  id: string;
  title: string;
  description: string;
  level: string;
  status: string;
  thumbnail?: string;
  startTime?: Date;
  endTime?: Date;
}

interface ScheduleData extends DocumentData {
  id: string;
  courseId: string;
  startTime: Date;
  endTime: Date;
  title?: string;
  description?: string;
}

export class StudentController {
  /**
   * Récupérer les cours disponibles pour l'étudiant selon son niveau
   */
  static async getAvailableCourses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const studentDoc = await firestore
        .collection("users")
        .doc(req.user.uid)
        .get();

      const studentData = studentDoc.data() as UserData;
      const studentLevel = studentData?.specialty || "none";

      // //console.log({
      //   studentLevel,
      // });

      const coursesSnapshot = await firestore
        .collection("courses")
        .where("status", "==", "published")
        .where("level", "==", studentLevel)
        .get();

      const courses = coursesSnapshot.docs.map(
        (doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })
      ) as CourseData[];

      res.status(200).json({
        success: true,
        message: "Cours disponibles récupérés avec succès",
        data: {
          courses,
          total: courses.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer les détails d'un cours spécifique
   */
  static async getCourseDetails(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId } = req.params;

      const courseDoc = await firestore
        .collection("courses")
        .doc(courseId)
        .get();

      if (!courseDoc.exists) {
        throw new ApiError(404, "Cours non trouvé");
      }

      const courseData = courseDoc.data() as CourseData;
      courseData.id = courseDoc.id;

      const studentDoc = await firestore
        .collection("users")
        .doc(req.user.uid)
        .get();

      const studentData = studentDoc.data() as UserData;
      const studentLevel = studentData?.specialty || "beginner";

      if (courseData?.level !== studentLevel) {
        throw new ApiError(
          403,
          "Vous n'avez pas le niveau requis pour ce cours"
        );
      }

      res.status(200).json({
        success: true,
        message: "Détails du cours récupérés avec succès",
        data: {
          course: courseData,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer l'emploi du temps de l'étudiant
   */
  static async getSchedule(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { start, end } = req.query;
      const startDate = start ? new Date(start as string) : new Date();
      const endDate = end
        ? new Date(end as string)
        : new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000);

      const studentDoc = await firestore
        .collection("users")
        .doc(req.user.uid)
        .get();

      const studentData = studentDoc.data() as UserData;
      const enrolledCourses = studentData?.enrolledCourses || [];

      const scheduleSnapshot = await firestore
        .collection("schedules")
        .where("courseId", "in", enrolledCourses)
        .get();

      const schedules = scheduleSnapshot.docs
        .map((doc: QueryDocumentSnapshot) => {
          const data = doc.data();
          const startTime = data.startTime.toDate();
          if (startTime >= startDate && startTime <= endDate) {
            return {
              id: doc.id,
              courseId: data.courseId,
              startTime,
              endTime: data.endTime.toDate(),
              title: data.title,
              description: data.description,
            } as ScheduleData;
          }
          return null;
        })
        .filter(
          (schedule: ScheduleData | null): schedule is ScheduleData =>
            schedule !== null
        );

      schedules.sort(
        (a: ScheduleData, b: ScheduleData) =>
          a.startTime.getTime() - b.startTime.getTime()
      );

      res.status(200).json({
        success: true,
        message: "Emploi du temps récupéré avec succès",
        data: {
          schedules,
          total: schedules.length,
          period: {
            start: startDate,
            end: endDate,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * S'inscrire à un cours
   */
  static async enrollInCourse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId } = req.params;
      const studentId = req.user.uid;

      const courseDoc = await firestore
        .collection("courses")
        .doc(courseId)
        .get();

      if (!courseDoc.exists) {
        throw new ApiError(404, "Cours non trouvé");
      }

      const courseData = courseDoc.data() as CourseData;
      courseData.id = courseDoc.id;

      if (courseData?.status !== "published") {
        throw new ApiError(
          400,
          "Ce cours n'est pas disponible pour inscription"
        );
      }

      const studentDoc = await firestore
        .collection("users")
        .doc(studentId)
        .get();

      const studentData = studentDoc.data() as UserData;
      if (courseData?.level !== studentData?.specialty) {
        throw new ApiError(
          400,
          "Vous n'avez pas le niveau requis pour ce cours"
        );
      }

      if (studentData?.enrolledCourses?.includes(courseId)) {
        throw new ApiError(400, "Vous êtes déjà inscrit à ce cours");
      }

      await firestore
        .collection("users")
        .doc(studentId)
        .update({
          enrolledCourses: [...(studentData?.enrolledCourses || []), courseId],
          updatedAt: new Date(),
        });

      res.status(200).json({
        success: true,
        message: "Inscription au cours réussie",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer le tableau de bord de l'étudiant
   */
  static async getDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const studentId = req.user.uid;

      const studentDoc = await firestore
        .collection("users")
        .doc(studentId)
        .get();

      const studentData = studentDoc.data() as UserData;
      const enrolledCourses = studentData?.enrolledCourses || [];

      // Récupérer l'abonnement actif
      const subscriptionSnapshot = await firestore
        .collection("subscriptions")
        .where("userId", "==", studentId)
        .where("status", "==", "actif")
        .limit(1)
        .get();

      const subscription = !subscriptionSnapshot.empty
        ? (subscriptionSnapshot.docs[0].data() as Subscription)
        : null;

      // //console.log("Sub: ", subscriptionSnapshot.docs[0].data());
      // Ajouter un avertissement si l'abonnement expire bientôt

      const stats = {
        totalCourses: enrolledCourses.length,
        completedCourses: 0,
        inProgressCourses: 0,
        averageProgress: 0,
        nextScheduledCourse: null as ScheduleData | null,
        subscription: subscription
          ? {
              id: subscription.id,
              status: subscription.status,
              montantMensuel: subscription.montantMensuel,
              specialty: subscription.specialty,
              dateDebut: subscription.dateDebut,
              warningMessage: null,
              prochainPaiement: subscription.prochainPaiement,
              dernierPaiement:
                subscription.historiquePayments.length > 0
                  ? subscription.historiquePayments[
                      subscription.historiquePayments.length - 1
                    ]
                  : null,
              totalPaiements: subscription.historiquePayments.length,
              paiementsReussis: subscription.historiquePayments.filter(
                (p: any) => p.status === "reussi"
              ).length,
            }
          : null,
        subscriptionStatus: subscription
          ? subscription.status
          : studentData.subscriptionStatus || "inactif",
      };

      if (enrolledCourses.length > 0) {
        const coursesProgress = studentData?.coursesProgress || {};
        let totalProgress = 0;

        enrolledCourses.forEach((courseId: string) => {
          const progress = coursesProgress[courseId]?.progress || 0;
          totalProgress += progress;

          if (progress === 100) {
            stats.completedCourses++;
          } else if (progress > 0) {
            stats.inProgressCourses++;
          }
        });

        stats.averageProgress = totalProgress / enrolledCourses.length;

        const now = new Date();
        const nextSchedule = await firestore
          .collection("schedules")
          .where("courseId", "in", enrolledCourses)
          .where("startTime", ">=", now)
          .orderBy("startTime", "asc")
          .limit(1)
          .get();

        if (!nextSchedule.empty) {
          const scheduleData = nextSchedule.docs[0].data();
          stats.nextScheduledCourse = {
            id: nextSchedule.docs[0].id,
            courseId: scheduleData.courseId,
            startTime: scheduleData.startTime.toDate(),
            endTime: scheduleData.endTime.toDate(),
            title: scheduleData.title,
            description: scheduleData.description,
          };
        }
      }

      if (subscription) {
        const maintenant = new Date();
        const prochainPaiement = formatFirestoreDate(
          subscription.prochainPaiement
        );
        const joursRestants = Math.ceil(
          (prochainPaiement.getTime() - maintenant.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // //console.log({
        //   maintenant,
        //   prochainPaiement,
        //   status: subscription.status,
        //   joursRestants
        // });

        if (joursRestants <= 7) {
          // //console.log({ joursRestants });
          if (stats.subscription) {
            Object.assign(stats.subscription, {
              warningMessage: `Attention : Votre abonnement expire dans ${joursRestants} jour${
                joursRestants > 1 ? "s" : ""
              }. Pensez à le renouveler.`,
            });
          }
        } else if (joursRestants <= 0) {
          // Mettre à jour le statut de l'abonnement dans Firestore
          await firestore
            .collection("subscriptions")
            .doc(subscription.id)
            .update({
              status: "inactif",
              updatedAt: maintenant,
            });

          // Mettre à jour le statut dans l'objet stats
          if (stats.subscription) {
            Object.assign(stats.subscription, {
              status: "inactif",
              warningMessage:
                "Votre abonnement a expiré. Veuillez le renouveler pour continuer à accéder à vos cours.",
            });
          }
        }
      }
      const data = {
        stats,
        student: {
          id: studentDoc.id,
          ...studentData,
        },
      };

      res.status(200).json({
        success: true,
        message: "Tableau de bord récupéré avec succès",
        data,
      });
    } catch (error) {
      //console.log(error);
      next(error);
    }
  }

  /**
   * Renouveler l'abonnement de l'étudiant
   */
  static async renewSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const studentId = req.user.uid;

      // Récupérer l'abonnement actuel
      const subscriptionSnapshot = await firestore
        .collection("subscriptions")
        .where("userId", "==", studentId)
        .limit(1)
        .get();

      // Récupérer l'abonnement actuel
      const studentSnapshot = await firestore
        .collection("users")
        .doc(studentId)
        .get();

      if (subscriptionSnapshot.empty) {
        throw new ApiError(404, "Aucun abonnement trouvé pour cet étudiant");
      }

      const subscription = subscriptionSnapshot.docs[0].data() as any;

      // //console.log(subscription);

      // Vérifier si l'abonnement n'est pas déjà actif et à jour
      const maintenant = new Date();
      const prochainPaiement = formatFirestoreDate(
        subscription.prochainPaiement
      );

      // //console.log({
      //   maintenant,
      //   prochainPaiement,
      //   status: subscription.status,
      //   comparison: prochainPaiement > maintenant
      // });

      if (subscription.status === "actif" && prochainPaiement > maintenant) {
        throw new ApiError(400, "Votre abonnement est déjà actif et à jour");
      }

      // Créer une nouvelle référence de paiement
      const paymentRef = `PAY-${Math.random().toString(36).substring(2, 15)}`;

      res.status(200).json({
        success: true,
        message: "Demande de renouvellement initiée",
        data: {
          paymentRef,
          amount: subscription.amount,
        },
      });
    } catch (error) {
      // //console.error("Erreur lors du renouvellement de l'abonnement:", error);
      next(error);
    }
  }
}
