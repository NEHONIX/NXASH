import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchCourseById, updateCourse } from "@/store/slices/courseSlice";
import { Course } from "@/types/course";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import "./EditCourse.scss";

const EditCourse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Course | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const course = useSelector((state: RootState) =>
    state.courses.courses.find((c) => c.id === id)
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById({ id }) as any);
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (course) {
      setFormData(course);
    }
  }, [course]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    try {
      await dispatch(updateCourse({ courseId: id!, data: formData }) as any);
      navigate("/courses");
    } catch (error) {
      //console.error("Erreur lors de la mise à jour du cours:", error);
      setErrors({
        submit: "Une erreur est survenue lors de la mise à jour du cours",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="edit-course-loading">
        <div className="spinner"></div>
        <p>Chargement du cours...</p>
      </div>
    );
  }

  return (
    <div className="edit-course-page">
      <div className="page-header">
        <button className="btn btn-icon" onClick={() => navigate("/courses")}>
          <FiArrowLeft /> Retour
        </button>
        <h1>Modifier le cours</h1>
      </div>

      <form onSubmit={handleSubmit} className="edit-course-form">
        <div className="form-group">
          <label>Titre du cours</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Durée (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Catégorie</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <div className="form-group">
            <label>Image de couverture</label>
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              required
              placeholder="URL de l'image"
            />
          </div>
        </div>

        {formData.thumbnail && (
          <div className="thumbnail-preview">
            <img src={formData.thumbnail} alt="Aperçu" />
          </div>
        )}

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/courses")}
          >
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <FiSave /> Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
