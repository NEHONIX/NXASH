import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { RootState } from "../store";
import { APP_ASSETS } from "../nehonix/assets/APP_ASSETS";
import { APP_ROUTES } from "./nehonix/app.endpoints";

const RejectedAccount = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user?.approvalStatus !== "rejected") {
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
        <h2>Compte Non Approuvé</h2>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p>Cher(e) {user?.name},</p>
          <p>
            Malheureusement, votre demande d'inscription n'a pas été approuvée.
          </p>
          <p>Cela peut être dû à plusieurs raisons :</p>
          <ul style={{ textAlign: "left", marginBottom: "1rem" }}>
            <li>Informations incomplètes ou incorrectes</li>
            <li>Non-respect des critères d'admission</li>
            <li>Documents manquants</li>
          </ul>
          <p>
            Pour plus d'informations ou pour faire une nouvelle demande,
            veuillez nous contacter :
          </p>
          <p>
            <strong>Email:</strong> support@nehonix.space
          </p>
          <p>
            <strong>Téléphone:</strong> +225 0712137266
          </p>
        </div>
        <Link
          to="/register"
          className="btn btn-primary"
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            textDecoration: "none",
            marginBottom: "1rem",
          }}
        >
          Faire une nouvelle demande
        </Link>
        <Link
          to={APP_ROUTES.LOGIN}
          style={{
            display: "block",
            textAlign: "center",
            color: "#666",
            textDecoration: "none",
          }}
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default RejectedAccount;
