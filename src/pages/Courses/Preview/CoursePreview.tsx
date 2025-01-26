import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { FiArrowLeft, FiClock, FiBook } from "react-icons/fi";
import "./CoursePreview.scss";

const CoursePreview = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeChapter, setActiveChapter] = useState<number>(0);

  const course = useSelector((state: RootState) =>
    state.courses.courses.find((c) => c.id === courseId)
  );

  if (!course) {
    return (
      <div className="course-preview-error">
        <h2>Cours non trouvé</h2>
        <button onClick={() => navigate("/courses")}>
          Retourner aux cours
        </button>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${remainingMinutes}min`;
  };

  return (
    <div className="course-preview">
      <div className="preview-header">
        <button className="back-button" onClick={() => navigate("/courses")}>
          <FiArrowLeft /> Retour aux cours
        </button>
        <div className="course-status" data-status={course.status}>
          {course.status}
        </div>
      </div>

      <div className="preview-hero">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="course-banner"
        />
        <div className="hero-content">
          <h1>{course.title}</h1>
          <p className="description">{course.description}</p>
          <div className="meta-info">
            <span>
              <FiClock /> {formatDuration(course.duration)}
            </span>
            <span>
              <FiBook /> {course.chapters.length} chapitres
            </span>
            <span className="level">{course.level}</span>
          </div>
        </div>
      </div>

      <div className="preview-content">
        <div className="content-section">
          <h2>À propos de ce cours</h2>
          <div className="about-grid">
            <div className="info-card">
              <h3>Prérequis</h3>
              <ul>
                {course.prerequisites?.map((prerequisite, index) => (
                  <li key={index}>{prerequisite}</li>
                )) || <li>Aucun prérequis nécessaire</li>}
              </ul>
            </div>
            <div className="info-card">
              <h3>Objectifs d'apprentissage</h3>
              <ul>
                {course.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2>Programme du cours</h2>
          <div className="chapters-list">
            {course.chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className={`chapter-item ${
                  activeChapter === index ? "active" : ""
                }`}
                onClick={() => setActiveChapter(index)}
              >
                <div className="chapter-header">
                  <h3>
                    <span className="chapter-number">Chapitre {index + 1}</span>
                    {chapter.title}
                  </h3>
                  <span className="duration">
                    {formatDuration(chapter.duration)}
                  </span>
                </div>
                {activeChapter === index && (
                  <div className="chapter-content">
                    <p>{chapter.description}</p>
                    {chapter.lessons.length > 0 && (
                      <ul className="lessons-list">
                        {chapter.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <span className="lesson-title">{lesson.title}</span>
                            <span className="lesson-duration">
                              {formatDuration(lesson.duration)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
