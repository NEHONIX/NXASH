import { useEffect, useState } from "react";
import { useAuth } from "../context/Auth_Check_context";
import { APP_ASSETS } from "../nehonix/assets/APP_ASSETS";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "./nehonix/app.endpoints";
import Footer from "../components/Footer";
import { APP_CONFIG } from "../config/app.config";

const Login = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    matricule: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(APP_ROUTES.DASHBOARD);
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Convertir le matricule en majuscules
      const loginData = {
        ...formData,
        matricule: formData.matricule.toUpperCase(),
      };

      const res = await login(loginData);
      //console.log("res: ", res);

      // navigate(APP_ROUTES.DASHBOARD, { replace: true });
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la connexion");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        <h2>Connexion Étudiant</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="matricule">Matricule</label>
            <input
              type="text"
              id="matricule"
              name="matricule"
              value={formData.matricule}
              onChange={handleChange}
              placeholder="Ex: NX-2501-0001"
              required
            />
            <small className="form-text text-muted">
              Utilisez le matricule qui vous a été fourni lors de l'inscription
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Votre mot de passe"
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
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem", color: "#666" }}>
          Pas encore de compte ? <a href="/register">S'inscrire</a>
          <br /> <br />
          Version : {APP_CONFIG.version}
        </p>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Login;
