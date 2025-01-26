import { useState } from "react";
import { Course } from "@/types/course";
import { FiX, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import "./CourseDetailsModal.scss";
import { useNavigate } from "react-router-dom";

interface CourseDetailsModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (courseId: string) => void;
}

const CourseDetailsModal = ({
  course,
  isOpen,
  onClose,
  onDelete,
}: CourseDetailsModalProps) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !course) return null;

  const handleEdit = () => {
    navigate(`/courses/edit/${course.id}`);
  };

  const handleDelete = async () => {
    if (!course || !onDelete) return;

    setIsDeleting(true);
    try {
      onDelete(course.id);
      onClose();
    } catch (error) {
      //console.error("Erreur lors de la suppression du cours:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="course-modal-overlay" onClick={onClose}>
      <div
        className="course-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          <FiX />
        </button>

        <div className="modal-header">
          <div className="course-image">
            <img src={course.thumbnail} alt={course.title} />
            <div className="course-status" data-status={course.status}>
              {course.status}
            </div>
          </div>
          <div className="header-content">
            <h2>{course.title}</h2>
            <p className="description">{course.description}</p>
          </div>
        </div>

        <div className="modal-content">
          <div className="info-grid">
            <div className="info-item">
              <label>Niveau</label>
              <span>{course.level}</span>
            </div>
            <div className="info-item">
              <label>Catégorie</label>
              <span>{course.category}</span>
            </div>
            <div className="info-item">
              <label>Durée totale</label>
              <span>{course.duration} minutes</span>
            </div>
            <div className="info-item">
              <label>Chapitres</label>
              <span>{course.chapters.length}</span>
            </div>
            <div className="info-item">
              <label>Créé le</label>
              <span>{formatDate(course.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Dernière mise à jour</label>
              <span>{formatDate(course.updatedAt)}</span>
            </div>
          </div>

          <div className="sections">
            <div className="section">
              <h3>Prérequis</h3>
              <ul>
                {course.prerequisites?.map((prerequisite, index) => (
                  <li key={index}>{prerequisite}</li>
                )) || <li>Aucun prérequis</li>}
              </ul>
            </div>

            <div className="section">
              <h3>Objectifs</h3>
              <ul>
                {course.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/courses/preview/${course.id}`)}
          >
            <FiEye /> Aperçu
          </button>
          <button className="btn btn-primary" onClick={handleEdit}>
            <FiEdit2 /> Modifier
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <FiTrash2 /> {isDeleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsModal;
