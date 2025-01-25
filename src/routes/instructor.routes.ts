import { Router } from "express";
import { instructorAuthMiddleware } from "../middlewares/instructor.auth.middleware";
import { CoursesController } from "../controllers/courses.controller";
import { AdminPaymentController } from "../controllers/admin.payment.controller";
import { paymentStatusLimiter } from "../middlewares/security.middleware";

const router: any = Router();

/**
 * @route   GET /api/instructor/courses
 * @desc    Récupérer tous les cours du professeur
 * @access  Private (Instructor only)
 */
router.get(
  "/courses",
  instructorAuthMiddleware,
  CoursesController.getInstructorCourses
);

/**
 * @route   GET /api/instructor/stats
 * @desc    Récupérer les statistiques du professeur
 * @access  Private (Instructor only)
 */
router.get(
  "/stats",
  instructorAuthMiddleware,
  CoursesController.getInstructorStats
);

/**
 * @route   POST /api/instructor/courses
 * @desc    Créer un nouveau cours
 * @access  Private (Instructor only)
 */
router.post(
  "/courses",
  instructorAuthMiddleware,
  CoursesController.createCourse
);

/**
 * @route   PUT /api/instructor/courses/:courseId
 * @desc    Mettre à jour un cours
 * @access  Private (Instructor only)
 */
router.put(
  "/courses/update/:courseId",
  instructorAuthMiddleware,
  CoursesController.updateCourse
);

/**
 * @route   DELETE /api/instructor/courses/:courseId
 * @desc    Supprimer un cours
 * @access  Private (Instructor only)
 */
router.delete(
  "/courses/:courseId",
  instructorAuthMiddleware,
  CoursesController.deleteCourse
);

/**
 * @route   POST /api/instructor/courses/:courseId/publish
 * @desc    Publier un cours
 * @access  Private (Instructor only)
 */
router.post(
  "/courses/:courseId/publish",
  instructorAuthMiddleware,
  CoursesController.publishCourse
);

/**
 * @route   POST /api/instructor/courses/:courseId/chapters
 * @desc    Ajouter un chapitre à un cours
 * @access  Private (Instructor only)
 */
router.post(
  "/courses/:courseId/chapters",
  instructorAuthMiddleware,
  CoursesController.addChapter
);

/**
 * @route   POST /api/instructor/courses/:courseId/chapters/:chapterId/lessons
 * @desc    Ajouter une leçon à un chapitre
 * @access  Private (Instructor only)
 */
router.post(
  "/courses/:courseId/chapters/:chapterId/lessons",
  instructorAuthMiddleware,
  CoursesController.addLesson
);

/**
 * @route   GET /api/instructor/recent-activities
 * @desc    Récupérer les activités récentes du professeur
 * @access  Private (Instructor only)
 */
router.get(
  "/recent-activities",
  instructorAuthMiddleware,
  CoursesController.getRecentActivities
);

/**
 * @route   GET /api/instructor/my-students
 * @desc    Récupérer les étudiants inscrits aux cours du professeur
 * @access  Private (Instructor only)
 */
router.get(
  "/my-students",
  instructorAuthMiddleware,
  CoursesController.getInstructorStudents
);

/**
 * @route   GET /api/instructor/students
 * @desc    Récupérer tous les étudiants de la plateforme
 * @access  Private (Instructor only)
 */
router.get(
  "/students",
  instructorAuthMiddleware,
  CoursesController.getAllStudents
);

/**
 * @route   GET /api/instructor/schedule
 * @desc    Récupérer l'emploi du temps de la semaine
 * @access  Private (Instructor only)
 */
router.get(
  "/schedule",
  instructorAuthMiddleware,
  CoursesController.getWeekSchedule
);

/**
 * @route   GET /api/instructor/schedules/upcoming
 * @desc    Récupérer l'emploi du temps de la semaine
 * @access  Private (Instructor only)
 */
router.get(
  "/schedules/upcoming",
  instructorAuthMiddleware,
  CoursesController.getWeekSchedule
);

/**
 * @route   POST /api/instructor/create-schedule
 * @desc    Créer un nouveau cours planifié
 * @access  Private (Instructor only)
 */
router.post(
  "/create-schedule",
  instructorAuthMiddleware,
  CoursesController.createSchedule
);

/**
 * @route   PATCH /api/instructor/schedule/:id
 * @desc    Modifier un cours planifié
 * @access  Private (Instructor only)
 */
router.patch(
  "/schedule/:id",
  instructorAuthMiddleware,
  CoursesController.updateSchedule
);

/**
 * @route   DELETE /api/instructor/schedule/:id
 * @desc    Supprimer un cours planifié
 * @access  Private (Instructor only)
 */
router.delete(
  "/schedule/:id",
  instructorAuthMiddleware,
  CoursesController.deleteSchedule
);

/**
 * @route   GET /api/instructor/courses/:courseId
 * @desc    Récupérer un cours par son ID
 * @access  Private (Instructor only)
 */
router.get(
  "/courses/get-by-id/:courseId",
  instructorAuthMiddleware,
  CoursesController.getCourseById
);

/**
 * Routes de gestion des paiements (Admin: Prof)
 */

/**
 * @route   GET /api/instructor/payments
 * @desc    Récupérer toutes les sessions de paiement
 * @access  Private (Instructor only)
 */
router.get(
  "/payments",
  paymentStatusLimiter,
  instructorAuthMiddleware,
  AdminPaymentController.getAllPaymentSessions
);

/**
 * @route   GET /api/instructor/payments/stats
 * @desc    Obtenir les statistiques des paiements
 * @access  Private (Instructor only)
 */
router.get(
  "/payments/stats",
  instructorAuthMiddleware,
  AdminPaymentController.getPaymentStats
);

/**
 * @route   GET /api/instructor/payments/:paymentRef
 * @desc    Récupérer une session de paiement spécifique
 * @access  Private (Instructor only)
 */
router.get(
  "/payments/:paymentRef",
  instructorAuthMiddleware,
  AdminPaymentController.getPaymentSession
);

/**
 * @route   PUT /api/instructor/payments/:paymentRef/status
 * @desc    Mettre à jour le statut d'une session de paiement
 * @access  Private (Instructor only)
 */
router.put(
  "/payments/:paymentRef/status",
  instructorAuthMiddleware,
  AdminPaymentController.updatePaymentStatus
);

export default router;
