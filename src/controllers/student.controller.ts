import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, StudentInfos } from "../types/auth";
import { Subscription } from "../types/subscription";
import ApiError from "../utils/ApiError";
import { firestore } from "../conf/firebase";
import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { formatFirestoreDate } from "../utils/dateUtils";
import { FORMATION_PRICES, PaymentDataInterface } from "../types/payment";
import { generateToken } from "../utils/jwt.utils";
// import ServerCaches from "../utils/cache/server.cache.ts.draft";
import chalk from "chalk";
import { filepath, readCache, writeCache } from "../utils/cache/server.cache";

interface CachedCourseData {
  timestamp: number;
  courseId: string;
  courseData: CourseData;
}

interface CourseCache {
  [courseId: string]: CachedCourseData;
}

interface CachedCoursesData {
  timestamp: number;
  studentLevel: string;
  courses: CourseData[];
}

interface CoursesCache {
  [studentLevel: string]: CachedCoursesData;
}

interface DashboardCacheData {
  timestamp: number;
  studentId: string;
  data: {
    stats: {
      totalCourses: number;
      completedCourses: number;
      inProgressCourses: number;
      averageProgress: number;
      nextScheduledCourse: ScheduleData | null;
      subscription: any;
      subscriptionStatus: string;
    };
    paymentData: PaymentDataInterface | null;
    student: StudentInfos;
  };
}

interface DashboardCache {
  [studentId: string]: DashboardCacheData;
}

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
      const path = "/getAvailableCourses.txt";
      // const cacheManager = new ServerCaches({
      //   filepath: "caches/availableCoursesCache.txt",
      // });
      // const readCache = cacheManager.readCache;
      // const writeCache = cacheManager.writeCache;

      // TTL plus court pour les cours disponibles car ils peuvent changer plus fréquemment
      const CACHE_TTL = 30 * 60 * 1000; // 30 minutes en millisecondes

      // Récupérer le niveau de l'étudiant
      const studentDoc = await firestore
        .collection("users")
        .doc(req.user.uid)
        .get();

      const studentData = studentDoc.data() as StudentInfos;
      const studentLevel = studentData?.specialty || "none";

      // Vérifier le cache
      const cachedData = readCache(filepath(path)) as CoursesCache;
      // console.log(
      //   chalk.blueBright(
      //     "Cours disponibles récupérés depuis le cache",
      //     "Fichier cache utilisé :",
      //     JSON.stringify({
      //       cachedData: cachedData?.[studentLevel],
      //     })
      //   )
      // );
      const cachedCourses = cachedData?.[studentLevel];

      if (cachedCourses && Date.now() - cachedCourses.timestamp < CACHE_TTL) {
        // console.log(chalk.yellowBright("Cours disponibles...envoie en cours"));
        return res.status(200).json({
          success: true,
          message: "Cours disponibles récupérés depuis le cache",
          data: {
            courses: cachedCourses.courses,
            total: cachedCourses.courses.length,
            fromCache: true,
          },
        });
      }

      // Si pas en cache ou cache expiré, récupérer depuis Firestore
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

      // Mettre en cache les nouvelles données
      const newCacheData: CoursesCache = {
        ...cachedData,
        [studentLevel]: {
          timestamp: Date.now(),
          studentLevel,
          courses,
        },
      };

      // Nettoyer les entrées expirées du cache
      Object.keys(newCacheData).forEach((key) => {
        if (Date.now() - newCacheData[key].timestamp > CACHE_TTL) {
          delete newCacheData[key];
        }
      });

      writeCache({
        filepath: filepath(path),
        data: newCacheData,
      });

      res.status(200).json({
        success: true,
        message: "Cours disponibles récupérés avec succès",
        data: {
          courses,
          total: courses.length,
          fromCache: false,
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
      const path = "/getCourseDetails.txt";
      // const filepath = "cache/getCourseDetails.txt";
      // const cacheManager = new ServerCaches({
      //   filepath: "caches/courseCache.json",
      // });
      // const readCache = cacheManager.readCache;
      // const writeCache = cacheManager.writeCache;

      // Configuration du TTL (Time To Live)
      const CACHE_TTL = 60 * 60 * 1000; // 1 heure en millisecondes

      // Vérifier le cache d'abord
      const cachedData = readCache(filepath(path)) as CourseCache;
      const cachedCourse = cachedData?.[courseId];

      if (cachedCourse && Date.now() - cachedCourse.timestamp < CACHE_TTL) {
        // Vérifier le niveau de l'étudiant avant de retourner les données en cache
        const studentDoc = await firestore
          .collection("users")
          .doc(req.user.uid)
          .get();

        const studentData = studentDoc.data() as StudentInfos;
        const studentLevel = studentData?.specialty || "beginner";

        if (cachedCourse.courseData?.level !== studentLevel) {
          throw new ApiError(
            403,
            "Vous n'avez pas le niveau requis pour ce cours"
          );
        }

        return res.status(200).json({
          success: true,
          message: "Détails du cours récupérés depuis le cache",
          data: {
            course: cachedCourse.courseData,
            fromCache: true,
          },
        });
      }

      // Si pas en cache ou cache expiré, récupérer depuis Firestore
      const courseDoc = await firestore
        .collection("courses")
        .doc(courseId)
        .get();

      if (!courseDoc.exists) {
        throw new ApiError(404, "Cours non trouvé");
      }

      const courseData = courseDoc.data() as CourseData;
      courseData.id = courseDoc.id;

      // Vérifier le niveau de l'étudiant
      const studentDoc = await firestore
        .collection("users")
        .doc(req.user.uid)
        .get();

      const studentData = studentDoc.data() as StudentInfos;
      const studentLevel = studentData?.specialty || "beginner";

      if (courseData?.level !== studentLevel) {
        throw new ApiError(
          403,
          "Vous n'avez pas le niveau requis pour ce cours"
        );
      }

      // Mettre en cache les nouvelles données
      const newCacheData: CourseCache = {
        ...cachedData,
        [courseId]: {
          timestamp: Date.now(),
          courseId,
          courseData,
        },
      };

      writeCache({
        data: newCacheData,
        filepath: filepath(path),
      });

      // Nettoyer les entrées expirées du cache
      Object.keys(newCacheData).forEach((key) => {
        if (Date.now() - newCacheData[key].timestamp > CACHE_TTL) {
          delete newCacheData[key];
        }
      });

      res.status(200).json({
        success: true,
        message: "Détails du cours récupérés avec succès",
        data: {
          course: courseData,
          fromCache: false,
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

      const studentData = studentDoc.data() as StudentInfos;
      const enrolledCourses = (studentData as any)?.enrolledCourses || []; //A faire car non correcte

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

      const studentData = studentDoc.data() as StudentInfos;
      if (courseData?.level !== studentData?.specialty) {
        throw new ApiError(
          400,
          "Vous n'avez pas le niveau requis pour ce cours"
        );
      }

      // if (studentData?.enrolledCourses?.includes(courseId)) {
      //   throw new ApiError(400, "Vous êtes déjà inscrit à ce cours");
      // }

      await firestore.collection("users").doc(studentId).update({
        // enrolledCourses: [...(studentData?.enrolledCourses || []), courseId],
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
      const path = "/getDashboard.txt";
      // const cacheManager = new ServerCaches({
      //   filepath: "caches/dashboardCache.json",
      // });
      // const readCache = cacheManager.readCache;
      // const writeCache = cacheManager.writeCache;
      // const filepath = "cache/getDashboard.txt";

      // TTL différents selon le type de données
      const CACHE_TTL = {
        NORMAL: 5 * 60 * 1000, // 5 minutes pour les données générales
        SUBSCRIPTION: 60 * 1000, // 1 minute pour les données d'abonnement
        SCHEDULE: 15 * 60 * 1000, // 15 minutes pour les horaires
      };

      // Vérifier le cache
      const cachedData = readCache(filepath(path)) as DashboardCache;
      const cachedDashboard = cachedData?.[studentId];

      const shouldRefreshSubscription =
        cachedDashboard?.data?.stats?.subscription &&
        Date.now() - cachedDashboard.timestamp > CACHE_TTL.SUBSCRIPTION;

      const shouldRefreshSchedule =
        cachedDashboard?.data?.stats?.nextScheduledCourse &&
        Date.now() - cachedDashboard.timestamp > CACHE_TTL.SCHEDULE;

      // Utiliser le cache si valide et pas besoin de rafraîchir l'abonnement
      if (
        cachedDashboard &&
        Date.now() - cachedDashboard.timestamp < CACHE_TTL.NORMAL &&
        !shouldRefreshSubscription &&
        !shouldRefreshSchedule
      ) {
        return res.status(200).json({
          success: true,
          message: "Tableau de bord récupéré depuis le cache",
          data: cachedDashboard.data,
          fromCache: true,
        });
      }

      // Récupération des données depuis Firestore
      const studentDoc = await firestore
        .collection("users")
        .doc(studentId)
        .get();

      const studentData = studentDoc.data() as StudentInfos;
      const enrolledCourses = (studentData as any)?.enrolledCourses || [];

      // Récupération de l'abonnement
      const subscriptionSnapshot = await firestore
        .collection("subscriptions")
        .where("userId", "==", studentId)
        .limit(1)
        .get();

      const subscription = !subscriptionSnapshot.empty
        ? (subscriptionSnapshot.docs[0].data() as Subscription)
        : null;

      // Construction des stats
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
          : studentData.paymentStatus || "inactif",
      };

      // Calcul des progrès si l'étudiant est inscrit à des cours
      if (enrolledCourses.length > 0) {
        const coursesProgress = (studentData as any)?.coursesProgress || {};
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

        // Récupération du prochain cours planifié
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

      // Gestion des données de paiement
      let paymentData: PaymentDataInterface | null = null;
      if (subscription) {
        const maintenant = new Date();
        const prochainPaiement = formatFirestoreDate(
          subscription.prochainPaiement
        );
        const joursRestants = Math.ceil(
          (prochainPaiement.getTime() - maintenant.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (joursRestants <= 0) {
          await firestore
            .collection("subscriptions")
            .doc(subscription.id)
            .update({
              status: "inactif",
              updatedAt: maintenant,
            });

          if (stats.subscription) {
            Object.assign(stats.subscription, {
              status: "inactif",
              warningMessage:
                "Votre abonnement a expiré. Veuillez le renouveler pour continuer à accéder à vos cours.",
            });
          }

          const token = await generateToken(studentData);
          paymentData = {
            u: studentData.name,
            e: studentData.email,
            m: studentData.matricule,
            s: studentData.specialty,
            t: token,
            a: subscription.montantMensuel,
          };
        } else if (joursRestants <= 7) {
          if (stats.subscription) {
            Object.assign(stats.subscription, {
              warningMessage: `Attention : Votre abonnement expire dans ${joursRestants} jour${
                joursRestants > 1 ? "s" : ""
              }. Pensez à le renouveler.`,
            });
          }
        }
      }

      const dashboardData = {
        stats,
        paymentData,
        student: {
          ...studentData,
        },
      };

      // Mise en cache des nouvelles données
      const newCacheData: DashboardCache = {
        ...cachedData,
        [studentId]: {
          timestamp: Date.now(),
          studentId,
          data: dashboardData,
        },
      };

      // Nettoyage des entrées expirées
      Object.keys(newCacheData).forEach((key) => {
        if (Date.now() - newCacheData[key].timestamp > CACHE_TTL.NORMAL) {
          delete newCacheData[key];
        }
      });

      writeCache({
        data: newCacheData,
        filepath: filepath(path),
      });

      res.status(200).json({
        success: true,
        message: "Tableau de bord récupéré avec succès",
        data: dashboardData,
        fromCache: false,
      });
    } catch (error) {
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
