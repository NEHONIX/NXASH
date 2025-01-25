import { RequestHandler, Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { CoursesController } from "../controllers/courses.controller";

const router: any = Router();

// Protection de toutes les routes des cours
router.use(authMiddleware as RequestHandler);

/**
 * @route   GET /api/courses
 * @desc    Récupérer tous les cours
 * @access  Public
 * @query   {string} status - Filtrer par statut (published, draft, archived)
 */
router.get("/", CoursesController.getAllCourses);

/**
 * @route   GET /api/courses/:courseId
 * @desc    Récupérer un cours par son ID
 * @access  Public (cours publiés) / Private (cours non publiés)
 */
router.get("/:courseId", authMiddleware, CoursesController.getCourseById);

// Créer un nouveau cours
router.post("/", CoursesController.createCourse);

// Mettre à jour un cours
router.put("/:id", CoursesController.updateCourse);

// Supprimer un cours
router.delete("/:id", CoursesController.deleteCourse);

export default router;
