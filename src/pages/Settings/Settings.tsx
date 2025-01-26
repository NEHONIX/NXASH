import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  updateProfile,
  changePassword,
  clearMessages,
} from "@/store/slices/settingsSlice";
import { FiSave, FiUser, FiLock, FiMail, FiPhone } from "react-icons/fi";
import "./Settings.scss";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { profile, loading, error, successMessage } = useSelector(
    (state: RootState) => state.settings
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mise à jour du profil
    if (
      formData.name !== profile.name ||
      formData.email !== profile.email ||
      formData.phone !== profile.phone
    ) {
      dispatch(
        updateProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }) as any
      );
    }

    // Changement de mot de passe
    if (formData.currentPassword && formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        // Gérer l'erreur de confirmation de mot de passe
        return;
      }
      dispatch(
        changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }) as any
      );

      // Réinitialiser les champs de mot de passe
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
  };

  return (
    <div className="settings-page">
      <h1>Paramètres</h1>

      {(successMessage || error) && (
        <div className={`alert ${error ? "alert-error" : "alert-success"}`}>
          {error || successMessage}
        </div>
      )}

      <div className="settings-container">
        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <h2>Informations personnelles</h2>
            <div className="form-group">
              <label>
                <FiUser className="icon" />
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                // defaultValue={user?.instructor?.name}
                value={formData.name || user?.instructor?.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiMail className="icon" />
                Email
              </label>
              <input
                type="email"
                name="email"
                // defaultValue={user?.instructor?.email}
                value={formData.email || user?.instructor?.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiPhone className="icon" />
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                // defaultValue={user?.instructor?.phone}
                value={formData.phone || user?.instructor?.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="settings-section">
            <h2>Sécurité</h2>
            <div className="form-group">
              <label>
                <FiLock className="icon" />
                Mot de passe actuel
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                <FiLock className="icon" />
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>
                <FiLock className="icon" />
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={6}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <FiSave className="icon" />
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
