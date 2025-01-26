import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/api";
import { APP_ASSETS } from "../nehonix/assets/APP_ASSETS";
import { APP_ROUTES } from "./nehonix/app.endpoints";
import {
  VALID_STUDENT_LEVELS,
  StudentLevel,
  SpecialtyLevel,
  IRegisterRequest,
} from "../types/auth";
import { encodeData } from "../utils/encryption";
import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "./utils/validation";
import { handleRegisterSubmit } from "./utils/handleSubmit.register";
import "../styles/auth.css";
import {
  GROUPED_SPECIALTIES,
  SPECIALTY_DESCRIPTIONS,
  SPECIALTY_PRICES,
} from "./utils/grouped_speciality";

interface FormData extends IRegisterRequest {
  confirmPassword: string;
  referralCode: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const inviteCode = queryParams.get("invite");

  const [formErrors, setFormErrors] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialty: "" as StudentLevel,
    referralCode: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    handleRegisterSubmit(e, {
      formData,
      setError,
      setFormErrors,
      setLoading,
      navigate,
      authService,
      SPECIALTY_PRICES,
      encodeData,
    });
  };

  useEffect(() => {
    //console.log("Code d'invitation reçu:", inviteCode);
    if (inviteCode) {
      setFormData((prev) => ({
        ...prev,
        referralCode: inviteCode,
      }));
    }
  }, [inviteCode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validation en temps réel
    if (name === "email") {
      setFormErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    } else if (name === "phone") {
      setFormErrors((prev) => ({
        ...prev,
        phone: validatePhone(value),
      }));
    } else if (name === "password") {
      setFormErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img
          src={APP_ASSETS.nxash.LOGO_REMOVED_BG}
          alt="NEHONIX Logo"
          style={{
            width: "150px",
            marginBottom: "2rem",
            display: "block",
            margin: "0 auto",
          }}
        />
        <h2>Inscription Étudiant</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Votre nom complet"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="no-reply@nehonix.space"
              required
              className={formErrors.email ? "error" : ""}
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+225 0XXXXXXXXX"
              required
              className={formErrors.phone ? "error" : ""}
            />
            {formErrors.phone && (
              <span className="error-message">{formErrors.phone}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="specialty">Spécialité</label>
            <select
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Sélectionnez votre spécialité</option>
              {Object.entries(GROUPED_SPECIALTIES).map(
                ([group, { description, levels }]) => (
                  <optgroup key={group} label={group} title={description}>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level} - {SPECIALTY_PRICES[level]} FCFA
                      </option>
                    ))}
                  </optgroup>
                )
              )}
            </select>
            {formData.specialty && (
              <small className="specialty-description">
                {
                  SPECIALTY_DESCRIPTIONS[
                    formData.specialty.split("-")[1] as SpecialtyLevel
                  ]
                }
              </small>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Choisissez un mot de passe"
              required
              className={formErrors.password ? "error" : ""}
            />
            {formErrors.password && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmez votre mot de passe"
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem", color: "#666" }}>
          Déjà inscrit ? <a href={APP_ROUTES.LOGIN}>Se connecter</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
