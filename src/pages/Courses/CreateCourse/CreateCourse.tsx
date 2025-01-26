import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createCourse } from "@/store/slices/courseSlice";
import { Course, CourseLevel, IChapter } from "@/types/course";
import { FiPlus, FiTrash2, FiArrowLeft } from "react-icons/fi";
import "./CreateCourse.scss";

const CreateCourse = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Course>({
    id: "",
    title: "",
    description: "",
    level: "FrontEnd-N0",
    duration: 0,
    category: "",
    prerequisites: [],
    objectives: [],
    content: [],
    chapters: [],
    courseUrl: "",
    courseUrlType: "video",
    thumbnail: "",
    status: "draft",
    instructorId: "", // Sera défini lors de la création
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [prerequisiteInput, setPrerequisiteInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");

  const courseLevels: CourseLevel[] = [
    "FrontEnd-N0",
    "BackEnd-N0",
    "FullStack-F0",
    "FrontEnd-N1",
    "BackEnd-N1",
    "FullStack-F1",
    "FrontEnd-N2",
    "BackEnd-N2",
    "FullStack-F2",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrerequisiteAdd = () => {
    if (prerequisiteInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        prerequisites: [
          ...(prev.prerequisites || []),
          prerequisiteInput.trim(),
        ],
      }));
      setPrerequisiteInput("");
    }
  };

  const handleObjectiveAdd = () => {
    if (objectiveInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, objectiveInput.trim()],
      }));
      setObjectiveInput("");
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites?.filter((_, i) => i !== index),
    }));
  };

  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const addChapter = () => {
    const newChapter: IChapter = {
      id: `chapter-${formData.chapters.length + 1}`,
      title: "",
      description: "",
      order: formData.chapters.length + 1,
      duration: 0,
      lessons: [],
    };

    setFormData((prev) => ({
      ...prev,
      chapters: [...prev.chapters, newChapter],
    }));
  };

  const updateChapter = (index: number, updates: Partial<IChapter>) => {
    setFormData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) =>
        i === index ? { ...chapter, ...updates } : chapter
      ),
    }));
  };

  const removeChapter = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = "Le titre est requis";
        }
        if (!formData.description.trim()) {
          newErrors.description = "La description est requise";
        }
        if (!formData.category.trim()) {
          newErrors.category = "La catégorie est requise";
        }
        if (formData.duration <= 0) {
          newErrors.duration = "La durée doit être supérieure à 0";
        }
        if (!formData.courseUrl.trim()) {
          newErrors.courseUrl = "L'URL du cours est requise";
        }
        break;

      case 2:
        if (formData.objectives.length === 0) {
          newErrors.objectives = "Au moins un objectif est requis";
        }
        break;

      case 3:
        if (formData.chapters.length === 0) {
          newErrors.chapters = "Au moins un chapitre est requis";
        } else {
          formData.chapters.forEach((chapter, index) => {
            if (!chapter.title.trim()) {
              newErrors[`chapter_${index}_title`] =
                "Le titre du chapitre est requis";
            }
            if (chapter.duration <= 0) {
              newErrors[`chapter_${index}_duration`] =
                "La durée du chapitre doit être supérieure à 0";
            }
          });
        }
        break;
      case 4:
        if (!formData.thumbnail.trim()) {
          newErrors.thumbnail = "L'image de couverture est requise";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      // navigate("/courses");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Valider toutes les étapes
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    try {
      await dispatch(
        createCourse({
          ...formData,
          status: "draft",
        }) as any
      );
      // console.log({
      //   ...formData,
      //   status: "draft",
      // });
      setLoading(false);
      navigate("/courses");
    } catch (error) {
      setLoading(false);
      //console.error("Erreur lors de la création du cours:", error);
      setErrors({
        submit: "Une erreur est survenue lors de la création du cours",
      });
    }
  };

  const renderBasicInfo = () => (
    <>
      <div className="form-group">
        <label>Titre du cours</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Ex: Introduction au développement Frontend"
        />
        {errors.title && <div className="error-message">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Description détaillée du cours..."
          rows={4}
        />
        {errors.description && (
          <div className="error-message">{errors.description}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Niveau</label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          >
            {courseLevels.map((level) => (
              <option key={level} value={level}>
                {level
                  .split("-")
                  .map((part) =>
                    part === "N0"
                      ? "Niveau 0"
                      : part === "N1"
                      ? "Niveau 1"
                      : part === "N2"
                      ? "Niveau 2"
                      : part === "F0"
                      ? "Niveau 0"
                      : part === "F1"
                      ? "Niveau 1"
                      : part === "F2"
                      ? "Niveau 2"
                      : part
                  )
                  .join(" - ")}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Catégorie</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="Ex: Développement Web"
          />
          {errors.category && (
            <div className="error-message">{errors.category}</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Durée (en minutes)</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
          min="0"
          step="15"
        />
        {errors.duration && (
          <div className="error-message">{errors.duration}</div>
        )}
      </div>

      <div className="form-group">
        <label>Type de contenu</label>
        <select
          name="courseUrlType"
          value={formData.courseUrlType}
          onChange={handleChange}
          required
        >
          <option value="video">Vidéo</option>
          <option value="document">Document</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          {formData.courseUrlType === "video"
            ? "URL de la vidéo"
            : "URL du document"}
        </label>
        <input
          type="url"
          name="courseUrl"
          value={formData.courseUrl}
          onChange={handleChange}
          required
          placeholder={
            formData.courseUrlType === "video"
              ? "Ex: https://youtube.com/watch?v=..."
              : "Ex: https://drive.google.com/..."
          }
        />
        {errors.courseUrl && (
          <div className="error-message">{errors.courseUrl}</div>
        )}
      </div>
    </>
  );

  const renderPrerequisitesAndObjectives = () => (
    <>
      <div className="form-group">
        <label>Prérequis</label>
        <div className="input-with-button">
          <input
            type="text"
            value={prerequisiteInput}
            onChange={(e) => setPrerequisiteInput(e.target.value)}
            placeholder="Ajouter un prérequis..."
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handlePrerequisiteAdd())
            }
          />
          <button type="button" onClick={handlePrerequisiteAdd}>
            Ajouter
          </button>
        </div>
        <div className="tags-container">
          {formData.prerequisites?.map((prerequisite, index) => (
            <span key={index} className="tag">
              {prerequisite}
              <button type="button" onClick={() => removePrerequisite(index)}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Objectifs d'apprentissage*</label>
        <div className="input-with-button">
          <input
            type="text"
            value={objectiveInput}
            onChange={(e) => setObjectiveInput(e.target.value)}
            placeholder="Ajouter un objectif..."
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleObjectiveAdd())
            }
          />
          <button type="button" onClick={handleObjectiveAdd}>
            Ajouter
          </button>
        </div>
        <div className="tags-container">
          {formData.objectives.map((objective, index) => (
            <span key={index} className="tag">
              {objective}
              <button type="button" onClick={() => removeObjective(index)}>
                ×
              </button>
            </span>
          ))}
          {errors.objectives && (
            <div className="error-message">{errors.objectives}</div>
          )}
        </div>
      </div>
    </>
  );

  const renderChapters = () => (
    <div className="chapters-section">
      <div className="section-header">
        <h3>Chapitres</h3>
        <button type="button" className="btn btn-primary" onClick={addChapter}>
          <FiPlus /> Ajouter un chapitre
        </button>
      </div>

      {formData.chapters.map((chapter, index) => (
        <div key={chapter.id} className="chapter-card">
          <div className="chapter-header">
            <span className="chapter-number">Chapitre {index + 1}</span>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeChapter(index)}
            >
              <FiTrash2 />
            </button>
          </div>

          <div className="form-group">
            <label>Titre du chapitre*</label>
            <input
              type="text"
              value={chapter.title}
              onChange={(e) => updateChapter(index, { title: e.target.value })}
              placeholder="Ex: Introduction aux bases"
              required
            />
            {errors[`chapter_${index}_title`] && (
              <div className="error-message">
                {errors[`chapter_${index}_title`]}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={chapter.description}
              onChange={(e) =>
                updateChapter(index, { description: e.target.value })
              }
              placeholder="Description du chapitre..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Durée (minutes)*</label>
            <input
              type="number"
              value={chapter.duration}
              onChange={(e) =>
                updateChapter(index, { duration: Number(e.target.value) })
              }
              min="0"
              step="15"
              required
            />
            {errors[`chapter_${index}_duration`] && (
              <div className="error-message">
                {errors[`chapter_${index}_duration`]}
              </div>
            )}
          </div>
        </div>
      ))}
      {errors.chapters && (
        <div className="error-message">{errors.chapters}</div>
      )}
    </div>
  );

  const renderThumbnail = () => (
    <div className="form-group">
      <label>Image de couverture</label>
      <div className="thumbnail-section">
        <input
          type="url"
          name="thumbnail"
          value={formData.thumbnail || ""}
          onChange={handleChange}
          placeholder="Entrez l'URL de l'image de couverture"
          className="form-control"
        />
        {formData.thumbnail && (
          <div className="thumbnail-preview">
            <img src={formData.thumbnail} alt="Aperçu du cours" />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() =>
                setFormData((prev) => ({ ...prev, thumbnail: "" }))
              }
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
      {errors.thumbnail && (
        <div className="error-message">{errors.thumbnail}</div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>Informations de base</h3>
            {renderBasicInfo()}
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h3>Prérequis et objectifs</h3>
            {renderPrerequisitesAndObjectives()}
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h3>Structure du cours</h3>
            {renderChapters()}
          </div>
        );
      case 4:
        return (
          <div className="step-content">
            <h3>Média</h3>
            {renderThumbnail()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-course-page">
      <div className="page-header">
        <button type="button" className="btn btn-icon" onClick={handleBack}>
          <FiArrowLeft /> Retour
        </button>
        <h1>Créer un nouveau cours</h1>
      </div>

      <div className="stepper">
        <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <span>Informations de base</span>
        </div>
        <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <span>Prérequis et objectifs</span>
        </div>
        <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <span>Structure du cours</span>
        </div>
        <div className={`step ${currentStep >= 4 ? "active" : ""}`}>
          <div className="step-number">4</div>
          <span>Média</span>
        </div>
      </div>

      {errors.submit && (
        <div className="error-message global">{errors.submit}</div>
      )}

      <div className="create-course-form">
        {renderCurrentStep()}

        <div className="form-navigation">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
          >
            {currentStep === 1 ? "Annuler" : "Précédent"}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span> En
                  cours...
                </>
              ) : (
                "Créer le cours"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
