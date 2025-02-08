import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AuthController } from "../controllers/auth.controller";
import { StudentController } from "../controllers/student.controller";
import referalsRouter from "./referals.routes";
import { addComment } from "./comments/add-comment";
import { getComments } from "./comments/get-comments";
import { deleteComment } from "./comments/delete-comment";
import nehonixRouter from "./nehonix.routes";
import { AIController } from "../controllers/ai.controller";

const router: any = Router();
/**
 * @route   POST /api/student/auth/register
 * @desc    Inscription d'un nouvel étudiant
 * @access  Public
 */
router.post("/auth/register", AuthController.register);

/**
 * @route   POST /api/student/auth/login
 * @desc    Connexion d'un étudiant
 * @access  Public
 */
router.post("/auth/login", AuthController.login);

/**
 * @route   GET /api/student/auth/check
 * @desc    Vérifier le token de l'étudiant
 * @access  Private
 */
router.get("/auth/check", authMiddleware, AuthController.checkAuth);

/**
 * @route   POST /api/student/auth/logout
 * @desc    Déconnexion de l'étudiant
 * @access  Private
 */
router.post("/auth/logout", authMiddleware, AuthController.logout);

/**
 * @route   GET /api/student/courses/getAll
 * @desc    Récupérer tous les cours disponibles
 * @access  Private (Student only)
 */
router.get(
  "/courses/getAll",
  authMiddleware,
  StudentController.getAvailableCourses
);

/**
 * @route   GET /api/student/courses/:courseId
 * @desc    Récupérer les détails d'un cours
 * @access  Private (Student only)
 */
router.get(
  "/courses/:courseId",
  authMiddleware,
  StudentController.getCourseDetails
);

/**
 * @route   POST /api/student/courses/:courseId/enroll
 * @desc    S'inscrire à un cours
 * @access  Private (Student only)
 */
router.post(
  "/courses/:courseId/enroll",
  authMiddleware,
  StudentController.enrollInCourse
);

/**
 * @route   GET /api/student/schedule
 * @desc    Récupérer l'emploi du temps de l'étudiant
 * @access  Private (Student only)
 */
router.get("/schedule", authMiddleware, StudentController.getSchedule);

/**
 * @route   GET /api/student/dashboard
 * @desc    Récupérer les statistiques du tableau de bord étudiant
 * @access  Private (Student only)
 */
router.get("/dashboard/stats", authMiddleware, StudentController.getDashboard);

/**
 * @route   POST /api/student/dashboard/subscription/renew
 * @desc    Renouveler l'abonnement de l'étudiant
 * @access  Private (Student only)
 */
router.post(
  "/dashboard/subscription/renew",
  authMiddleware,
  StudentController.renewSubscription
);

router.use("/dashboard/referals", referalsRouter);

// Like/Unlike a course
// router.post("/:courseId/like", likeCourse);

// Comments
router.post("/:courseId/comments", authMiddleware, addComment);
router.get("/:courseId/comments", authMiddleware, getComments);
router.delete("/comments/:commentId", authMiddleware, deleteComment);

/**
 * @route   POST /api/student/nehonix-labs
 * @desc    Renouveler l'abonnement de l'étudiant
 * @access  Private (Student only)
 */
// router.use("/nehonix-labs", nehonixRouter);// /api/student/nehonix-labs/ai/generate-exo
router.post(
  "/api/student/nehonix-labs/ai/generate-exo",
  authMiddleware,
  AIController.generateProgrammingExercise
); // /api/student/nehonix-labs/ai/generate-exo

export default router;
