import { useLocation, Navigate } from "react-router-dom";
import { APP_ASSETS } from "../nehonix/assets/APP_ASSETS";
import { APP_ROUTES } from "./nehonix/app.endpoints";

const RegistrationSuccess = () => {
  const location = useLocation();
  const userData = location.state?.userData;

  if (!userData) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: "center" }}>
          <img
            src={APP_ASSETS.nehonix.LOGO}
            alt="NEHONIX Logo"
            style={{ width: "150px", marginBottom: "2rem" }}
          />
          <h2>Inscription Réussie !</h2>

          <div
            className="success-message"
            style={{ marginTop: "2rem", marginBottom: "2rem" }}
          >
            <p>
              Votre compte a été créé avec succès et est en attente
              d'approbation.
            </p>

            <div
              className="matricule-box"
              style={{
                background: "#f8f9fa",
                padding: "1.5rem",
                borderRadius: "8px",
                margin: "2rem 0",
                border: "2px dashed #007bff",
              }}
            >
              <h3 style={{ color: "#007bff", marginBottom: "1rem" }}>
                Votre Matricule
              </h3>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#28a745",
                }}
              >
                {userData.matricule}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6c757d",
                  marginTop: "1rem",
                }}
              >
                Conservez précieusement ce matricule, il vous servira pour vous
                connecter.
              </p>
            </div>

            <div className="next-steps" style={{ marginTop: "2rem" }}>
              <h4>Prochaines étapes :</h4>
              <ol style={{ textAlign: "left", marginTop: "1rem" }}>
                <li>
                  Attendez l'approbation de votre compte par l'administration
                </li>
                <li>
                  Une fois approuvé, connectez-vous avec :
                  <ul style={{ marginTop: "0.5rem" }}>
                    <li>
                      Votre matricule : <strong>{userData.matricule}</strong>
                    </li>
                    <li>Votre mot de passe</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="contact-info" style={{ marginTop: "2rem" }}>
              <p>Pour toute assistance :</p>
              <p>
                <strong>Email:</strong> support@nehonix.space
              </p>
              <p>
                <strong>Téléphone:</strong> +225 0712137266
              </p>
            </div>
          </div>

          <a
            href={APP_ROUTES.LOGIN}
            className="btn btn-primary"
            style={{ display: "inline-block", marginTop: "1rem" }}
          >
            Aller à la page de connexion
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
