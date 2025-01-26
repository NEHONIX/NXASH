import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  fetchAllCourses,
  updateCourseProgress,
} from "../store/slices/courseSlice";
import { GET_PATH_TITLE } from "../utils/getTitle";
import { Clock, GraduationCap, BookOpen } from "lucide-react";
import { Course, StudentLevel } from "../types";
import { CourseWithProgress } from "../types/progress";
import { Link } from "react-router-dom";
import "../styles/courses.scss";
import { APP_ROUTES } from "./nehonix/app.endpoints";

const getLevelLabel = (level: StudentLevel): string => {
  switch (level) {
    case "FrontEnd-N0":
    case "BackEnd-N0":
    case "FullStack-F0":
      return "Débutant";
    case "FrontEnd-N1":
    case "BackEnd-N1":
    case "FullStack-F1":
      return "Intermédiaire";
    case "FrontEnd-N2":
    case "BackEnd-N2":
    case "FullStack-F2":
      return "Avancé";
    default:
      return "Inconnu";
  }
};

const getSpecialityLabel = (level: StudentLevel): string => {
  if (level.startsWith("FrontEnd")) return "Front-end";
  if (level.startsWith("BackEnd")) return "Back-end";
  if (level.startsWith("FullStack")) return "Full-stack";
  return "Inconnu";
};

const calculateCourseProgress = (
  course: Course
): { progress: number; completedChapters: string[] } => {
  // Calculer la progression basée sur les chapitres et leçons
  let totalLessons = 0;
  let completedLessons = 0;
  const completedChapters: string[] = [];

  course.chapters.forEach((chapter) => {
    const chapterLessons = chapter.lessons.length;
    const chapterCompletedLessons = chapter.lessons.filter(
      (lesson) => lesson.type === "video" || lesson.type === "quiz"
    ).length;

    totalLessons += chapterLessons;
    completedLessons += chapterCompletedLessons;

    // Un chapitre est considéré comme complété si tous ses modules sont terminés
    if (chapterLessons === chapterCompletedLessons) {
      completedChapters.push(chapter.id);
    }
  });

  // Calcul du pourcentage de progression
  const progress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return { progress, completedChapters };
};

// Fonction utilitaire pour tronquer la description
const truncateDescription = (
  description: string,
  maxLength: number = 100
): string => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + "...";
};

const Courses = () => {
  const [activeTab, setActiveTab] = useState("all");
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { courses, loading, error } = useSelector(
    (state: RootState) => state.courses
  );

  // Fonction de mise à jour périodique des cours
  const periodicCourseUpdate = useCallback(() => {
    dispatch(updateCourseProgress());
  }, [dispatch]);

  // Effet initial pour charger les cours
  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  // Effet pour la mise à jour périodique
  useEffect(() => {
    const intervalId = setInterval(periodicCourseUpdate, 6000); // Toutes les 6 secondes
    return () => clearInterval(intervalId); // Nettoyage à la désinscription
  }, [periodicCourseUpdate]);

  // Effet pour le titre de la page
  useEffect(() => {
    GET_PATH_TITLE(user?.name + " - Mes Cours | NXASH");
  }, [user?.name]);

  const coursesWithProgress: CourseWithProgress[] = courses.map((course) => ({
    ...course,
    ...calculateCourseProgress(course),
  }));

  const filteredCourses = coursesWithProgress.filter((course) => {
    if (activeTab === "completed") return course.progress === 100;
    if (activeTab === "in-progress") return course.progress < 100;
    return true;
  });

  if (loading) {
    return (
      <div className="courses-container">
        <div className="loading">Chargement des cours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-container">
        <div className="error">{error}</div>
      </div>
    );
  } else if (courses.length === 0) {
    return (
      <div className="courses-container">
        <div className="no-courses">Aucun cours disponible pour l'instant.</div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="header">
        <h1>Mes Cours</h1>
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Tous
          </button>
          <button
            className={`tab-button ${
              activeTab === "in-progress" ? "active" : ""
            }`}
            onClick={() => setActiveTab("in-progress")}
          >
            En cours
          </button>
          <button
            className={`tab-button ${
              activeTab === "completed" ? "active" : ""
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Terminés
          </button>
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.map((course) => (
          <div key={course.id} className="course-card">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="thumbnail"
            />
            <div className="content">
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className={`progress ${
                      course.progress === 100 ? "completed" : "in-progress"
                    }`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span
                  className={`progress-text ${
                    course.progress === 100 ? "completed" : "in-progress"
                  }`}
                >
                  {course.progress}%
                </span>
              </div>

              <h3 className="title">{course.title}</h3>
              <p className="description">
                {truncateDescription(course.description)}
              </p>

              <div className="meta">
                <span className="duration">
                  <Clock size={16} />
                  {course.duration} minutes
                </span>
                <span className="level">
                  <GraduationCap size={16} />
                  {getLevelLabel(course.level)}
                </span>
                <span className="category">
                  <BookOpen size={16} />
                  {getSpecialityLabel(course.level)}
                </span>
              </div>

              <div className="chapters">
                <h4 className="chapter-title">
                  Chapitres ({course.chapters.length})
                </h4>
                <div className="chapter-list">
                  {course.chapters.slice(0, 3).map((chapter) => (
                    <div
                      key={chapter.id}
                      className={`chapter-item ${
                        course.completedChapters.includes(chapter.id)
                          ? "completed"
                          : ""
                      }`}
                    >
                      {course.completedChapters.includes(chapter.id)
                        ? "✅"
                        : "⭕"}{" "}
                      {chapter.title}
                    </div>
                  ))}
                  {course.chapters.length > 3 && (
                    <div className="chapter-item more">
                      +{course.chapters.length - 3} autres chapitres
                    </div>
                  )}
                </div>
              </div>

              <Link to={APP_ROUTES.COURSE_DETAIL(course.id)}>
                <button
                  className={`action-button ${
                    course.progress === 100 ? "Terminé" : ""
                  }`}
                >
                  {course.progress === 100 ? "Revoir le cours" : "Continuer"}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
