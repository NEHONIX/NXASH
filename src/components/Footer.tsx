import React from "react";
import { APP_CONFIG } from "../config/app.config";
import "../styles/footer.scss";
const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <p className="version">Version {APP_CONFIG.version}</p>
          <p className="copyright">
            © {APP_CONFIG.year} {APP_CONFIG.company}. Tous droits réservés.
          </p>
        </div>
        {/* <div className="footer-love">
          <p>
            Fait avec <Heart size={16} className="heart-icon" /> en Côte d'Ivoire
          </p>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
