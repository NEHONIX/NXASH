import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { RootState } from "../store";
import { APP_ASSETS } from "../nehonix/assets/APP_ASSETS";
import { APP_ROUTES } from "./nehonix/app.endpoints";

const PendingApproval = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user?.approvalStatus !== "pending") {
    return <Navigate to="/register" replace />;
  }
  return (
    <div className="auth-container">
      <div className="auth-card">
        <img
          src={APP_ASSETS.nehonix.LOGO}
          alt="NEHONIX Logo"
          style={{
            width: "150px",
            marginBottom: "2rem",
            display: "block",
            margin: "0 auto",
          }}
        />
        <h2>Compte en Attente d'Approbation</h2>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p>Cher(e) {user?.name},</p>
          <p>
            Votre compte est actuellement en attente d'approbation par
            l'administration.
          </p>
          <p>Vous recevrez un email dès que votre compte sera approuvé.</p>
          <p>Pour toute question, n'hésitez pas à nous contacter :</p>
          <p>
            <strong>Email:</strong> support@nehonix.space
          </p>
          <p>
            <strong>Téléphone:</strong> +225 0712137266
          </p>
        </div>
        <Link
          to={APP_ROUTES.LOGIN}
          className="btn btn-primary"
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default PendingApproval;
