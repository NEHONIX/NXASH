import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  Book,
  PlayCircle,
  FileText,
  FileVideo,
  ExternalLink,
} from "lucide-react";
import { Course } from "../types";
import VideoPlayer from "../components/VideoPlayer";
import "../styles/course-detail.scss";
import { formatDateToFr, formatFirestoreDate } from "../utils/dateUtils";

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // États pour la navigation et le contenu
  const [activeSection, setActiveSection] = useState<"description" | "content">(
    "description"
  );
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Récupérer le cours depuis le store Redux
  const { courses } = useSelector((state: RootState) => state.courses);
  const course = courses.find((c) => c.id === courseId);

  // Gérer la navigation vers le contenu du cours
  const handleCourseNavigation = (course: Course) => {
    if (course.courseUrlType === "video") {
      setIsVideoPlaying(true);
    } else {
      window.open(course.courseUrl, "_blank");
    }
  };

  // //console.log(course?.courseUrl);
  const publishDate = (course: Course) =>
    formatDateToFr(formatFirestoreDate(course.updatedAt)).split("à");

  // Rendu conditionnel si le cours n'est pas trouvé
  if (!course) {
    return (
      <div className="course-detail-error">
        <p>Cours non trouvé</p>
        <button onClick={() => navigate("/courses")}>Retour aux cours</button>
      </div>
    );
  }

  return (
    <>
      <div className="course-detail-container">
        {/* En-tête du cours */}
        <div className="course-header">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="course-thumbnail"
          />
          <div className="course-info">
            <h1>{course.title}</h1>
            <p>Publié le {publishDate(course).join("à")}</p>

            <div className="course-meta">
              <span>
                <Book size={16} /> Niveau : {course.level}
              </span>
              <span>
                <PlayCircle size={16} /> Durée : {course.duration} minutes
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="course-navigation">
          <button
            className={activeSection === "description" ? "active" : ""}
            onClick={() => setActiveSection("description")}
          >
            <FileText size={16} /> Description
          </button>
          <button
            className={activeSection === "content" ? "active" : ""}
            onClick={() => setActiveSection("content")}
          >
            <Book size={16} /> Contenu du cours
          </button>
        </div>

        {/* Bouton d'accès au cours */}
        <div className="course-action">
          <button
            className="start-course-btn"
            onClick={() => handleCourseNavigation(course)}
          >
            {course.courseUrlType === "video"
              ? "Commencer la vidéo"
              : "Accéder au document"}
            <ExternalLink size={16} />
          </button>
        </div>

        {/* Contenu dynamique */}
        <div className="course-content">
          {activeSection === "description" && (
            <div className="description-section">
              <h2>Description</h2>
              <p>{course.description}</p>
              <h2>Objectifs du cours</h2>
              <ul>
                {course.objectives.map((obj, index) => (
                  <li key={index}>{obj}</li>
                ))}
              </ul>

              <h2>Prérequis</h2>
              {course.prerequisites && course.prerequisites.length > 0 ? (
                <ul>
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              ) : (
                <p>Aucun prérequis nécessaire</p>
              )}
            </div>
          )}

          {activeSection === "content" && (
            <div className="course-structure">
              <div className="chapters-list">
                <h2>Chapitres</h2>
                {course.chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={`chapter-item ${
                      selectedChapter === chapter.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedChapter(chapter.id)}
                  >
                    {chapter.title}
                    <span>{chapter.lessons.length} leçons</span>
                  </div>
                ))}
              </div>

              {selectedChapter && (
                <div className="chapter-lessons">
                  <h3>Leçons du chapitre</h3>
                  {course.chapters
                    .find((ch) => ch.id === selectedChapter)
                    ?.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`lesson-item ${
                          selectedLesson === lesson.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedLesson(lesson.id)}
                      >
                        {lesson.type === "video" && <FileVideo size={16} />}
                        {lesson.type === "quiz" && <Book size={16} />}
                        {lesson.title}
                        <span>{lesson.duration} min</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lecteur vidéo */}
      <VideoPlayer
        videoUrl={course.courseUrl}
        isOpen={isVideoPlaying}
        onClose={() => setIsVideoPlaying(false)}
        title={course.title}
      />
    </>
  );
};

export default CourseDetail;
