import { useNavigate } from "react-router-dom";
import { FiLogOut, FiBell } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import "./Navbar.scss";
import { APP_ASSETS } from "@/nehonix/assets/APP_ASSETS";

const Navbar = () => {
  const navigate = useNavigate();
  const { user: AUTH_USER_RESPONSE } = useAuth();
  const { logout } = useAuth();
  const user = AUTH_USER_RESPONSE?.instructor;
  //console.log(user);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      //console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img
          src={APP_ASSETS.nehonix.LOGO_REMOVED_BG}
          alt="Nehonix"
          className="navbar-logo"
        />
        <h1>Espace Professeur</h1>
      </div>

      <div className="navbar-menu">
        <div className="navbar-notifications">
          <FiBell className="icon" />
          <span className="notification-badge">3</span>
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          <FiLogOut className="icon" />
          <span>Déconnexion</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
