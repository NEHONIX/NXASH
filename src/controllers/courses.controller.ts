import { Response, NextFunction } from "express";
import { firestore } from "../conf/firebase";
import { AuthenticatedRequest } from "../types/custom";
import ApiError from "../utils/ApiError";
import { Course } from "../types/course";
import { Query, CollectionReference } from "@google-cloud/firestore";
import { IUser } from "../types/model";

export class CoursesController {
  static async createCourse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const courseData = req.body as Course;
      const instructorId = req.user.uid;

      // Validation des données
      if (!courseData.title || !courseData.description || !courseData.level) {
        throw new ApiError(
          400,
          "Le titre, la description et le niveau sont requis"
        );
      }

      // Créer le cours avec la nouvelle structure
      const course: Course = {
        id: "", // sera remplacé par l'ID Firestore
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        duration: courseData.duration || 0,
        category: courseData.category || "Non catégorisé",
        prerequisites: courseData.prerequisites || [],
        objectives: courseData.objectives || [],
        content: courseData.content || [],
        resources: courseData.resources || [],
        quizzes: courseData.quizzes || [],
        status: courseData.status || "draft",
        instructorId,
        chapters: courseData.chapters || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        courseUrl: courseData.courseUrl || "",
        courseUrlType: courseData.courseUrlType || "video",
        thumbnail: courseData.thumbnail || "",
        publishedAt: courseData.publishedAt || new Date(),
      };

      const courseRef = await firestore.collection("courses").add(course);
      course.id = courseRef.id;

      await courseRef.update({ id: courseRef.id });

      res.status(201).json({
        success: true,
        message: "Cours créé avec succès",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  static async publishCourse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId } = req.params;

      const courseRef = firestore.collection("courses").doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) {
        throw new ApiError(404, "Cours non trouvé");
      }

      const courseData = courseDoc.data() as Course;

      // Vérifier que le prof est bien le propriétaire du cours
      if (courseData.instructorId !== req.user.uid) {
        throw new ApiError(403, "Vous n'êtes pas autorisé à modifier ce cours");
      }

      // Vérifier que le cours a au moins un chapitre
      if (!courseData.chapters || courseData.chapters.length === 0) {
        throw new ApiError(400, "Le cours doit avoir au moins un chapitre");
      }

      await courseRef.update({
        status: "published",
        publishedAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Cours publié avec succès",
      });
    } catch (error) {
      next(error);
    }
  }

  static async addChapter(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId } = req.params;
      const { title, description } = req.body;

      if (!title || !description) {
        throw new ApiError(400, "Le titre et la description sont requis");
      }

      const courseRef = firestore.collection("courses").doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) {
        throw new ApiError(404, "Cours non trouvé");
      }

      const courseData = courseDoc.data() as Course;

      // Vérifier que le prof est bien le propriétaire du cours
      if (courseData.instructorId !== req.user.uid) {
        throw new ApiError(403, "Vous n'êtes pas autorisé à modifier ce cours");
      }

      const newChapter = {
        id: `chapter_${Date.now()}`,
        title,
        description,
        order: courseData.chapters.length + 1,
        duration: 0,
        lessons: [],
      };

      await courseRef.update({
        chapters: [...courseData.chapters, newChapter],
        updatedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        message: "Chapitre ajouté avec succès",
        data: newChapter,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addLesson(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId, chapterId } = req.params;
      const { title, description, content, videoUrl, duration, type } =
        req.body;

      if (!title || !description || !content) {
        throw new ApiError(
          400,
          "Le titre, la description et le contenu sont requis"
        );
      }

      const courseRef = firestore.collection("courses").doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) {
        throw new ApiError(404, "Cours non trouvé");
      }

      const courseData = courseDoc.data() as Course;

      // Vérifier que le prof est bien le propriétaire du cours
      if (courseData.instructorId !== req.user.uid) {
        throw new ApiError(403, "Vous n'êtes pas autorisé à modifier ce cours");
      }

      const chapterIndex = courseData.chapters.findIndex(
        (chapter) => chapter.id === chapterId
      );

      if (chapterIndex === -1) {
        throw new ApiError(404, "Chapitre non trouvé");
      }

      const newLesson = {
        id: `lesson_${Date.now()}`,
        title,
        description,
        content,
        videoUrl,
        resources: [],
        duration: duration || 0,
        order: courseData.chapters[chapterIndex].lessons.length + 1,
        type: type || "text",
      };

      courseData.chapters[chapterIndex].lessons.push(newLesson);
      courseData.chapters[chapterIndex].duration += newLesson.duration;

      await courseRef.update({
        chapters: courseData.chapters,
        updatedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        message: "Leçon ajoutée avec succès",
        data: newLesson,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllCourses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Par défaut, on ne récupère que les cours publiés
      const status = req.query.status || "published";
      let query: Query = firestore.collection("courses");

      // Si un statut est spécifié, on filtre par ce statut
      if (status) {
        query = query.where("status", "==", status);
      }

      const coursesSnapshot = await query.get();
      const courses = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];

      res.status(200).json({
        success: true,
        message: "Liste des cours récupérée avec succès",
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseById(
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

      const courseData = {
        id: courseDoc.id,
        ...courseDoc.data(),
      } as Course;

      // Si le cours n'est pas publié, seul le propriétaire peut le voir
      if (
        courseData.status !== "published" &&
        courseData.instructorId !== req.user.uid
      ) {
        throw new ApiError(403, "Vous n'êtes pas autorisé à voir ce cours");
      }

      res.status(200).json({
        success: true,
        message: "Cours récupéré avec succès",
        data: courseData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCourse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId } = req.params;
      const updateData = req.body;

      // Vérifier que le cours existe
      const courseRef = firestore.collection("courses").doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) {
        throw new ApiError(404, "Cours non trouvé");
      }
      // //console.log("cours trouvé donc on continue");

      const courseData = courseDoc.data() as Course;

      // Vérifier que le prof est bien le propriétaire du cours
      if (
        courseData.instructorId.toLocaleLowerCase().trim() !==
        req.user.uid.toLocaleLowerCase().trim()
      ) {
        throw new ApiError(403, "Vous n'êtes pas autorisé à modifier ce cours");
      }
      // //console.log("cours propriétaire donc on continue");
      // On ne permet pas de modifier certains champs directement
      const protectedFields = ["id", "instructorId", "createdAt"];
      protectedFields.forEach((field) => {
        delete updateData[field];
      });

      // Validation du niveau si fourni
      const validLevels = [
        "FrontEnd-N0",
        "BackEnd-N0",
        "FullStack-F0",
        "FrontEnd-N1",
        "BackEnd-N1",
        "FullStack-F1",
        "FrontEnd-N2",
        "BackEnd-N2",
        "FullStack-F2",
      ];

      if (updateData.level && !validLevels.includes(updateData.level)) {
        throw new ApiError(400, "Niveau de cours invalide");
      }
      // //console.log("cours valide donc on continue");
      // Mettre à jour le cours
      await courseRef.update({
        ...updateData,
        updatedAt: new Date(),
      });

      // Récupérer le cours mis à jour
      const updatedCourseDoc = await courseRef.get();
      const updatedCourse = {
        id: updatedCourseDoc.id,
        ...updatedCourseDoc.data(),
      } as Course;

      // //console.log("cours mis à jour");
      res.status(200).json({
        success: true,
        message: "Cours mis à jour avec succès",
        data: updatedCourse,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCourse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId } = req.params;

      // Vérifier que le cours existe
      const courseRef = firestore.collection("courses").doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) {
        throw new ApiError(404, "Cours non trouvé");
      }

      const courseData = courseDoc.data() as Course;

      // Vérifier que le prof est bien le propriétaire du cours
      if (courseData.instructorId !== req.user.uid) {
        throw new ApiError(
          403,
          "Vous n'êtes pas autorisé à supprimer ce cours"
        );
      }

      // Vérifier s'il y a des étudiants inscrits
      const enrollmentsSnapshot = await firestore
        .collection("enrollments")
        .where("courseId", "==", courseId)
        .get();

      if (!enrollmentsSnapshot.empty) {
        throw new ApiError(
          400,
          "Impossible de supprimer un cours avec des étudiants inscrits"
        );
      }

      // Supprimer le cours
      await courseRef.delete();

      res.status(200).json({
        success: true,
        message: "Cours supprimé avec succès",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInstructorCourses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const courses = await firestore
        .collection("courses")
        .where("instructorId", "==", req.user.uid)
        .get();

      const coursesList = courses.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({
        success: true,
        message: "Cours récupérés avec succès",
        data: {
          courses: coursesList,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInstructorStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Obtenir tous les cours de l'instructeur
      const coursesSnapshot = await firestore
        .collection("courses")
        .where("instructorId", "==", req.user.uid)
        .get();

      // Obtenir tous les utilisateurs qui suivent au moins un cours de l'instructeur
      const usersSnapshot = await firestore
        .collection("users")
        .where(
          "enrolledCourses",
          "array-contains-any",
          coursesSnapshot.docs.map((doc) => doc.id)
        )
        .get();

      // Calculer les statistiques
      const stats = {
        totalCourses: coursesSnapshot.size,
        publishedCourses: coursesSnapshot.docs.filter(
          (doc) => doc.data().status === "published"
        ).length,
        draftCourses: coursesSnapshot.docs.filter(
          (doc) => doc.data().status === "draft"
        ).length,
        totalStudents: usersSnapshot.size,
        totalRevenue: coursesSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          return acc + (data.revenue || 0);
        }, 0),
        averageRating:
          coursesSnapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            return acc + (data.rating || 0);
          }, 0) / (coursesSnapshot.size || 1),
        completionRate:
          usersSnapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            const coursesProgress = data.coursesProgress || {};
            const userCompletionRates = coursesSnapshot.docs.map(
              (courseDoc) => coursesProgress[courseDoc.id]?.progress || 0
            );

            return (
              acc +
              userCompletionRates.reduce((sum, rate) => sum + rate, 0) /
                (userCompletionRates.length || 1)
            );
          }, 0) / (usersSnapshot.size || 1),
      };

      // Mettre à jour les stats du professeur
      await firestore
        .collection("instructors")
        .doc(req.user.uid)
        .update({
          stats: {
            totalStudents: stats.totalStudents,
            totalCourses: stats.totalCourses,
            completionRate: stats.completionRate,
            totalRevenue: stats.totalRevenue,
            averageRating: stats.averageRating,
          },
          updatedAt: new Date(),
        });

      res.status(200).json({
        success: true,
        message: "Statistiques récupérées avec succès",
        data: {
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecentActivities(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Récupérer les différents types d'activités
      const [enrollments, completions, reviews, comments] = await Promise.all([
        // Nouvelles inscriptions
        firestore
          .collection("enrollments")
          .where("instructorId", "==", req.user.uid)
          .where("enrolledAt", ">=", thirtyDaysAgo)
          .orderBy("enrolledAt", "desc")
          .limit(10)
          .get(),

        // Cours complétés
        firestore
          .collection("enrollments")
          .where("instructorId", "==", req.user.uid)
          .where("completedAt", ">=", thirtyDaysAgo)
          .where("status", "==", "completed")
          .orderBy("completedAt", "desc")
          .limit(10)
          .get(),

        // Nouvelles évaluations
        firestore
          .collection("reviews")
          .where("instructorId", "==", req.user.uid)
          .where("createdAt", ">=", thirtyDaysAgo)
          .orderBy("createdAt", "desc")
          .limit(10)
          .get(),

        // Nouveaux commentaires
        firestore
          .collection("comments")
          .where("instructorId", "==", req.user.uid)
          .where("createdAt", ">=", thirtyDaysAgo)
          .orderBy("createdAt", "desc")
          .limit(10)
          .get(),
      ]);

      // Transformer et combiner toutes les activités
      const activities = [
        ...enrollments.docs.map((doc) => ({
          id: doc.id,
          type: "enrollment",
          timestamp: doc.data().enrolledAt,
          data: doc.data(),
        })),
        ...completions.docs.map((doc) => ({
          id: doc.id,
          type: "completion",
          timestamp: doc.data().completedAt,
          data: doc.data(),
        })),
        ...reviews.docs.map((doc) => ({
          id: doc.id,
          type: "review",
          timestamp: doc.data().createdAt,
          data: doc.data(),
        })),
        ...comments.docs.map((doc) => ({
          id: doc.id,
          type: "comment",
          timestamp: doc.data().createdAt,
          data: doc.data(),
        })),
      ];

      // Trier par date décroissante
      activities.sort(
        (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()
      );

      res.status(200).json({
        success: true,
        message: "Activités récentes récupérées avec succès",
        data: {
          activities: activities.slice(0, 20), // Limiter à 20 activités les plus récentes
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInstructorStudents(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Récupérer d'abord tous les cours du professeur
      const coursesSnapshot = await firestore
        .collection("courses")
        .where("instructorId", "==", req.user.uid)
        .get();

      const courseIds = coursesSnapshot.docs.map((doc) => doc.id);

      // Récupérer toutes les inscriptions pour ces cours
      const enrollmentsSnapshot = await firestore
        .collection("enrollments")
        .where("courseId", "in", courseIds)
        .get();

      // Récupérer les IDs uniques des étudiants
      const studentIds = [
        ...new Set(enrollmentsSnapshot.docs.map((doc) => doc.data().studentId)),
      ];

      // Récupérer les informations détaillées de chaque étudiant
      const studentsData = await Promise.all(
        studentIds.map(async (studentId) => {
          const studentDoc = await firestore
            .collection("users")
            .doc(studentId)
            .get();

          if (!studentDoc.exists) return null;

          const studentData = studentDoc.data();

          // Calculer les statistiques pour cet étudiant
          const studentEnrollments = enrollmentsSnapshot.docs.filter(
            (doc) => doc.data().studentId === studentId
          );

          const stats = {
            totalCourses: studentEnrollments.length,
            completedCourses: studentEnrollments.filter(
              (doc) => doc.data().status === "completed"
            ).length,
            averageProgress:
              studentEnrollments.reduce(
                (acc, doc) => acc + (doc.data().progress || 0),
                0
              ) / studentEnrollments.length,
            lastActive: studentEnrollments.reduce((latest, doc) => {
              const lastAccess = doc.data().lastAccessedAt;
              return lastAccess > latest ? lastAccess : latest;
            }, new Date(0)),
          };

          return {
            id: studentId,
            name: studentData?.name,
            email: studentData?.email,
            avatar: studentData?.avatar,
            phone: studentData?.phone,
            matricule: studentData?.matricule,
            stats,
            enrolledCourses: await Promise.all(
              studentEnrollments.map(async (enrollment) => {
                const courseDoc = await firestore
                  .collection("courses")
                  .doc(enrollment.data().courseId)
                  .get();

                return {
                  id: courseDoc.id,
                  title: courseDoc.data()?.title,
                  progress: enrollment.data().progress,
                  status: enrollment.data().status,
                  enrolledAt: enrollment.data().enrolledAt,
                  lastAccessedAt: enrollment.data().lastAccessedAt,
                };
              })
            ),
          };
        })
      );

      // Filtrer les étudiants null et trier par nom
      const validStudents = studentsData
        .filter((student) => student !== null)
        .sort((a, b) => a.name.localeCompare(b.name));

      res.status(200).json({
        success: true,
        message: "Liste des étudiants récupérée avec succès",
        data: {
          students: validStudents,
          total: validStudents.length,
          stats: {
            totalActiveStudents: validStudents.length,
            averageCompletionRate:
              validStudents.reduce(
                (acc, student) => acc + student.stats.averageProgress,
                0
              ) / validStudents.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllStudents(
    _: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Récupérer tous les utilisateurs avec le rôle "student"
      const studentsSnapshot = await firestore
        .collection("users")
        .where("role", "==", "student")
        .get();

      // Récupérer toutes les inscriptions
      const enrollmentsSnapshot = await firestore
        .collection("enrollments")
        .get();

      const studentsData = await Promise.all(
        studentsSnapshot.docs.map(async (doc) => {
          const studentData = doc.data() as IUser;
          const studentId = doc.id;

          // Trouver toutes les inscriptions de l'étudiant
          const studentEnrollments = enrollmentsSnapshot.docs.filter(
            (doc) => doc.data().studentId === studentId
          );

          // Calculer les statistiques
          const stats = {
            totalCourses: studentEnrollments.length,
            completedCourses: studentEnrollments.filter(
              (doc) => doc.data().status === "completed"
            ).length,
            averageProgress:
              studentEnrollments.reduce(
                (acc, doc) => acc + (doc.data().progress || 0),
                0
              ) / (studentEnrollments.length || 1),
            lastActive: studentEnrollments.reduce((latest, doc) => {
              const lastAccess =
                doc.data().lastAccessedAt?.toDate() || new Date(0);
              return lastAccess > latest ? lastAccess : latest;
            }, new Date(0)),
          };

          // Récupérer les détails des cours
          const coursesDetails = await Promise.all(
            studentEnrollments.map(async (enrollment) => {
              const courseDoc = await firestore
                .collection("courses")
                .doc(enrollment.data().courseId)
                .get();

              const courseData = courseDoc.data();
              const enrollmentData = enrollment.data();

              return {
                id: courseDoc.id,
                title: courseData?.title,
                instructor: courseData?.instructor,
                progress: enrollmentData.progress,
                status: enrollmentData.status,
                enrolledAt: enrollmentData.enrolledAt?.toDate(),
                lastAccessedAt: enrollmentData.lastAccessedAt?.toDate(),
              };
            })
          );

          return {
            id: studentId,
            name: studentData.name,
            email: studentData.email,
            phone: studentData.phone,
            matricule: studentData.matricule,
            avatar: studentData.avatar,
            approvalStatus: studentData.approvalStatus,
            createdAt: studentData.createdAt,
            stats,
            enrolledCourses: coursesDetails,
          };
        })
      );

      // Calculer les statistiques globales
      const globalStats = {
        totalStudents: studentsData.length,
        activeStudents: studentsData.filter(
          (student) =>
            student.stats.lastActive >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        averageCoursesPerStudent:
          studentsData.reduce(
            (acc, student) => acc + student.stats.totalCourses,
            0
          ) / studentsData.length,
        averageCompletionRate:
          studentsData.reduce(
            (acc, student) => acc + student.stats.averageProgress,
            0
          ) / studentsData.length,
      };

      res.status(200).json({
        success: true,
        message: "Liste des étudiants récupérée avec succès",
        data: {
          students: studentsData,
          total: studentsData.length,
          stats: globalStats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getWeekSchedule(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { start, end } = req.query;

      // Si les dates ne sont pas fournies, utiliser les 7 prochains jours par défaut
      if (!start || !end) {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 15);
        start = now.toISOString();
        end = nextWeek.toISOString();
      }

      try {
        const startDate = new Date(start as string);
        const endDate = new Date(end as string);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Dates invalides");
        }

        // Ajuster les heures pour couvrir toute la journée
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Requête pour récupérer les plannings
        const scheduleSnapshot = await firestore
          .collection("schedules")
          .where("instructorId", "==", req.user.uid)
          .get();

        // Filtrer les plannings pour la période demandée
        const schedules = await Promise.all(
          scheduleSnapshot.docs
            .filter((doc) => {
              const data = doc.data();
              const scheduleStart = data.startTime.toDate();
              return scheduleStart >= startDate && scheduleStart <= endDate;
            })
            .map(async (doc) => {
              const scheduleData = doc.data();
              const courseDoc = await firestore
                .collection("courses")
                .doc(scheduleData.courseId)
                .get();

              return {
                id: doc.id,
                ...scheduleData,
                startTime: scheduleData.startTime.toDate(),
                endTime: scheduleData.endTime.toDate(),
                course: courseDoc.exists
                  ? {
                      id: courseDoc.id,
                      title: courseDoc.data()?.title,
                      thumbnail: courseDoc.data()?.thumbnail,
                    }
                  : null,
              };
            })
        );

        // Trier les résultats par date de début
        schedules.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

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
      } catch (dateError) {
        //console.error("Erreur de parsing des dates:", dateError);
        throw new ApiError(
          400,
          "Format de date invalide. Utilisez le format YYYY-MM-DD"
        );
      }
    } catch (error) {
      next(error);
    }
  }

  static async createSchedule(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId, startTime, endTime, title, description } = req.body;

      if (!courseId || !startTime || !endTime || !title) {
        throw new ApiError(
          400,
          "Le cours, les horaires et le titre sont requis"
        );
      }

      // Vérifier que le cours existe et appartient au professeur
      const courseDoc = await firestore
        .collection("courses")
        .doc(courseId)
        .get();

      if (!courseDoc.exists) {
        throw new ApiError(404, "Cours non trouvé");
      }

      if (courseDoc.data()?.instructorId !== req.user.uid) {
        throw new ApiError(
          403,
          "Vous n'êtes pas autorisé à planifier ce cours"
        );
      }

      // Créer le planning
      const scheduleData = {
        courseId,
        instructorId: req.user.uid,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const scheduleRef = await firestore
        .collection("schedules")
        .add(scheduleData);
      const scheduleDoc = await scheduleRef.get();

      res.status(201).json({
        success: true,
        message: "Cours planifié avec succès",
        data: {
          schedule: {
            id: scheduleDoc.id,
            ...scheduleDoc.data(),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSchedule(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const scheduleRef = firestore.collection("schedules").doc(id);
      const scheduleDoc = await scheduleRef.get();

      if (!scheduleDoc.exists) {
        throw new ApiError(404, "Planning non trouvé");
      }

      if (scheduleDoc.data()?.instructorId !== req.user.uid) {
        throw new ApiError(
          403,
          "Vous n'êtes pas autorisé à modifier ce planning"
        );
      }

      // Mettre à jour les dates si fournies
      if (updateData.startTime) {
        updateData.startTime = new Date(updateData.startTime);
      }
      if (updateData.endTime) {
        updateData.endTime = new Date(updateData.endTime);
      }

      await scheduleRef.update({
        ...updateData,
        updatedAt: new Date(),
      });

      const updatedDoc = await scheduleRef.get();

      res.status(200).json({
        success: true,
        message: "Planning mis à jour avec succès",
        data: {
          schedule: {
            id: updatedDoc.id,
            ...updatedDoc.data(),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSchedule(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const scheduleRef = firestore.collection("schedules").doc(id);
      const scheduleDoc = await scheduleRef.get();

      if (!scheduleDoc.exists) {
        throw new ApiError(404, "Planning non trouvé");
      }

      if (scheduleDoc.data()?.instructorId !== req.user.uid) {
        throw new ApiError(
          403,
          "Vous n'êtes pas autorisé à supprimer ce planning"
        );
      }

      await scheduleRef.delete();

      res.status(200).json({
        success: true,
        message: "Planning supprimé avec succès",
      });
    } catch (error) {
      next(error);
    }
  }
}
