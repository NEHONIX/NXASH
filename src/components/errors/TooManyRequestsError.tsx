import React from "react";
import "./TooManyRequestsError.scss";
import { APP_ROUTES } from "../../pages/nehonix/app.endpoints";

const TooManyRequestsError: React.FC = () => {
  return (
    <div className="too-many-requests">
      <div className="error-container">
        <div className="error-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-.5-13h1v6h-1zm0 8h1v2h-1z" />
          </svg>
        </div>
        <h1>Trop de requêtes</h1>
        <p>
          Nous avons détecté un nombre important de requêtes depuis votre
          appareil.
        </p>
        <p>Veuillez patienter quelques instants avant de réessayer.</p>
        <div className="timer">
          <div className="timer-circle">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
            </svg>
            <span className="timer-count">30</span>
          </div>
        </div>
        <button
          className="retry-button"
          onClick={() => window.location.replace(APP_ROUTES.DASHBOARD)}
        >
          Réessayer maintenant
        </button>
      </div>
    </div>
  );
};

export default TooManyRequestsError;
