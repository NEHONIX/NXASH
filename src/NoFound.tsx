import { Link } from "react-router-dom";
import { APP_ASSETS } from "./nehonix/assets/APP_ASSETS";
import { APP_ROUTES } from "./pages/nehonix/app.endpoints";
import "./styles/notfound.scss";

const NotFound = () => {
  return (
    <div className="not-found-container">
      <img
        src={APP_ASSETS.nxash.LOGO_REMOVED_BG}
        alt="NEHONIX Logo"
        className="logo"
      />
      <h1 className="error-code">404</h1>
      <p className="error-message">
        Oups ! La page que vous recherchez semble avoir disparu dans le
        cyberespace.
      </p>
      <div className="actions">
        <Link to={APP_ROUTES.DASHBOARD} className="btn btn-primary">
          Retour au tableau de bord
        </Link>
        <Link to={APP_ROUTES.LOGIN} className="btn btn-secondary">
          Se connecter
        </Link>
      </div>
      <p className="help-text">
        Besoin d'aide ? Contactez notre support au{" "}
        <a href="tel:+2250700000000"> +225 0712137266</a>
      </p>
    </div>
  );
};

export default NotFound;
