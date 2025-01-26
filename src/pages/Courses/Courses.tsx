import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchCourses, deleteCourse } from "@/store/slices/courseSlice";
import {
  FiPlus,
  FiSearch,
  FiBook,
  FiClock,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import CourseDetailsModal from "./components/CourseDetailsModal";
import "./Courses.scss";
import { useNavigate } from "react-router-dom";
import { APP_ASSETS } from "@/nehonix/assets/APP_ASSETS";
import { Course, CourseLevel } from "@/types/course";

const Courses = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<{
    [key: string]: boolean;
  }>({});
  const { courses, loading, error } = useSelector(
    (state: RootState) => state.courses
  );
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCourses() as any);
  }, [dispatch]);

  // Filtrer les cours en fonction de la recherche
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouper les cours par niveau
  const coursesByLevel = filteredCourses.reduce((acc, course) => {
    const level = course.level;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(course);
    return acc;
  }, {} as { [key in CourseLevel]: Course[] });

  // Fonction pour basculer l'expansion d'un niveau
  const toggleLevel = (level: string) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  // Fonction pour formater le nom du niveau
  const formatLevelName = (level: string) => {
    const [specialty, levelNum] = level.split("-");
    const levelMap: { [key: string]: string } = {
      N0: "Niveau 0",
      N1: "Niveau 1",
      N2: "Niveau 2",
      F0: "Niveau 0",
      F1: "Niveau 1",
      F2: "Niveau 2",
    };
    return `${specialty} - ${levelMap[levelNum] || levelNum}`;
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await dispatch(deleteCourse(courseId) as any);
      // Rafraîchir la liste des cours après la suppression
      dispatch(fetchCourses() as any);
    } catch (error) {
      //console.error("Erreur lors de la suppression du cours:", error);
    }
  };

  if (loading) {
    return (
      <div className="courses-loading">
        <div className="spinner"></div>
        <p>Chargement des cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-error">
        <p>Une erreur est survenue lors du chargement des cours.</p>
        <button onClick={() => dispatch(fetchCourses() as any)}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Mes cours</h1>
        <div className="header-actions">
          <div className="search-bar">
            <FiSearch className="icon" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/courses/create")}
          >
            <FiPlus className="icon" />
            Nouveau cours
          </button>
        </div>
      </div>

      <div className="courses-sections">
        {Object.entries(coursesByLevel).map(([level, levelCourses]) => (
          <div key={level} className="level-section">
            <div className="level-header" onClick={() => toggleLevel(level)}>
              <h2>{formatLevelName(level)}</h2>
              <span className="course-count">{levelCourses.length} cours</span>
              {expandedLevels[level] ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {expandedLevels[level] && (
              <div className="courses-grid">
                {levelCourses.map((course) => (
                  <div
                    key={course.id}
                    className="course-card"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="course-image">
                      <img
                        src={course.thumbnail || APP_ASSETS.sample.img}
                        alt={course.title}
                      />
                      <div
                        className="course-status"
                        data-status={course.status}
                      >
                        {course.status}
                      </div>
                    </div>
                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <div className="course-meta">
                        <span>
                          <FiClock className="icon" />
                          {course.duration} min
                        </span>
                        <span>
                          <FiBook className="icon" />
                          {course.chapters.length} chapitres
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="no-courses">
            <p>Aucun cours trouvé</p>
          </div>
        )}
      </div>

      <CourseDetailsModal
        course={selectedCourse}
        isOpen={selectedCourse !== null}
        onClose={() => setSelectedCourse(null)}
        onDelete={handleDeleteCourse}
      />
    </div>
  );
};

export default Courses;
