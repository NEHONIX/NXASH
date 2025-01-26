import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { createScheduledCourse } from "@/store/slices/scheduleSlice";
import { FiX } from "react-icons/fi";
import "./NewScheduleModal.scss";

interface NewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

const NewScheduleModal = ({
  isOpen,
  onClose,
  selectedDate,
}: NewScheduleModalProps) => {
  const dispatch = useDispatch();
  const { courses } = useSelector((state: RootState) => state.courses);
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        startTime: `${formattedDate}T09:00`,
        endTime: `${formattedDate}T10:30`,
      }));
    }
  }, [selectedDate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        createScheduledCourse({
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
        }) as any
      );
      onClose();
    } catch (error) {
      //console.error('Erreur lors de la création du cours:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Nouveau cours planifié</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="courseId">Cours</label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un cours</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Titre de la séance</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ex: Introduction aux variables"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description de la séance..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Début</label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">Fin</label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Créer le cours
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewScheduleModal;
