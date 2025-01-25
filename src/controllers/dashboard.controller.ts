import { Request, Response, NextFunction } from "express";
import { firestore } from "../conf/firebase";
import { AuthenticatedRequest } from "../types/custom";
import ApiError from "../utils/ApiError";
import { Activity, DashboardStats, NextLesson, Referral, Subscription } from "../types/dashboard";

export class DashboardController {
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.uid;

      // Récupérer les statistiques des cours
      const coursesSnapshot = await firestore
        .collection("user_courses")
        .where("userId", "==", userId)
        .get();

      const totalCourses = coursesSnapshot.size;
      let completedCourses = 0;
      let totalProgress = 0;

      coursesSnapshot.forEach(doc => {
        const courseData = doc.data();
        totalProgress += courseData.progress || 0;
        if (courseData.progress === 100) completedCourses++;
      });

      const coursesProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

      // Récupérer le prochain cours
      const nextLessonSnapshot = await firestore
        .collection("scheduled_lessons")
        .where("userId", "==", userId)
        .where("date", ">=", new Date())
        .orderBy("date", "asc")
        .limit(1)
        .get();

      let nextLesson = null;
      if (!nextLessonSnapshot.empty) {
        const lessonData = nextLessonSnapshot.docs[0].data();
        nextLesson = {
          title: lessonData.title,
          date: lessonData.date.toISOString().split('T')[0],
          time: lessonData.time,
          courseId: lessonData.courseId
        };
      }

      // Récupérer les parrainages
      const referralsSnapshot = await firestore
        .collection("referrals")
        .where("referrerId", "==", userId)
        .get();

      // Récupérer l'abonnement
      const subscriptionSnapshot = await firestore
        .collection("subscriptions")
        .where("userId", "==", userId)
        .limit(1)
        .get();

      let subscription = {
        status: "Inactif" as const,
        nextPayment: new Date().toISOString()
      };

      if (!subscriptionSnapshot.empty) {
        const subData = subscriptionSnapshot.docs[0].data();
        subscription = {
          status: subData.status,
          nextPayment: subData.nextPayment.toISOString()
        };
      }

      // Récupérer les activités récentes
      const activitiesSnapshot = await firestore
        .collection("activities")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(5)
        .get();

      const recentActivities = activitiesSnapshot.docs.map(doc => {
        const activity = doc.data();
        return {
          id: doc.id,
          type: activity.type,
          title: activity.title,
          timestamp: activity.timestamp.toISOString()
        };
      });

      const stats: DashboardStats = {
        coursesProgress,
        totalCourses,
        completedCourses,
        nextLesson,
        referrals: referralsSnapshot.size,
        subscription,
        recentActivities
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActivities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.uid;
      const activitiesSnapshot = await firestore
        .collection("activities")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .get();

      const activities = activitiesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          title: data.title,
          timestamp: data.timestamp.toISOString(),
          metadata: data.metadata
        };
      });

      res.status(200).json({
        success: true,
        data: { activities }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNextLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.uid;
      const lessonSnapshot = await firestore
        .collection("scheduled_lessons")
        .where("userId", "==", userId)
        .where("date", ">=", new Date())
        .orderBy("date", "asc")
        .limit(1)
        .get();

      if (lessonSnapshot.empty) {
        throw new ApiError(404, "Aucun cours programmé");
      }

      const lessonData = lessonSnapshot.docs[0].data();
      const courseSnapshot = await firestore
        .collection("courses")
        .doc(lessonData.courseId)
        .get();

      const courseData = courseSnapshot.data();

      const nextLesson: NextLesson = {
        title: lessonData.title,
        date: lessonData.date.toISOString().split('T')[0],
        time: lessonData.time,
        courseId: lessonData.courseId,
        courseName: courseData?.title || "",
        instructorName: courseData?.instructorName || ""
      };

      res.status(200).json({
        success: true,
        data: nextLesson
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReferrals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.uid;
      const referralsSnapshot = await firestore
        .collection("referrals")
        .where("referrerId", "==", userId)
        .get();

      const referralPromises = referralsSnapshot.docs.map(async doc => {
        const referral = doc.data();
        const referredUser = await firestore
          .collection("users")
          .doc(referral.referredUserId)
          .get();

        const userData = referredUser.data();
        return {
          id: doc.id,
          referredUser: {
            name: userData?.name || "",
            email: userData?.email || ""
          },
          status: referral.status,
          createdAt: referral.createdAt.toISOString(),
          completedAt: referral.completedAt?.toISOString()
        };
      });

      const referralsList = await Promise.all(referralPromises);
      const activeReferrals = referralsList.filter(r => r.status === "completed").length;
      const pendingReferrals = referralsList.filter(r => r.status === "pending").length;

      res.status(200).json({
        success: true,
        data: {
          totalReferrals: referralsSnapshot.size,
          activeReferrals,
          pendingReferrals,
          referralsList
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.uid;
      const subscriptionSnapshot = await firestore
        .collection("subscriptions")
        .where("userId", "==", userId)
        .limit(1)
        .get();

      if (subscriptionSnapshot.empty) {
        throw new ApiError(404, "Aucun abonnement trouvé");
      }

      const subscriptionData = subscriptionSnapshot.docs[0].data() as Subscription;

      res.status(200).json({
        success: true,
        data: {
          status: subscriptionData.status,
          plan: subscriptionData.plan,
          startDate: subscriptionData.startDate.toISOString(),
          endDate: subscriptionData.endDate.toISOString(),
          nextPayment: subscriptionData.nextPayment.toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
