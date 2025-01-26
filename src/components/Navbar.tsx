import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { RootState } from "../store";
import { APP_ASSETS } from "../nehonix/assets/APP_ASSETS";
import { APP_ROUTES } from "../pages/nehonix/app.endpoints";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  //console.log(user);

  const handleLogout = async () => {
    try {
      await dispatch(logout() as any);
      navigate(APP_ROUTES.LOGIN);
    } catch (error) {
      //console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <nav className="navbar">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={APP_ASSETS.nxash.LOGO_REMOVED_BG}
            alt="NEHONIX Logo"
            className="navbar-logo"
          />
          <div className="navbar-links" style={{ marginLeft: "2rem" }}>
            <Link to="/">Dashboard</Link>
            <Link to="/courses">Mes Cours</Link>
            <Link to="/profile">Mon Profil</Link>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "white" }}>{user?.name.split(" ")[0]}</span>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: "0.5rem 1rem" }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
