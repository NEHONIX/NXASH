import { NavLink } from "react-router-dom";
import { APP_ROUTES } from "../pages/nehonix/app.endpoints";

const Sidebar = () => {
  const menuItems = [
    { path: APP_ROUTES.DASHBOARD, label: "📊 Dashboard" },
    { path: APP_ROUTES.COURSES, label: "📚 Mes Cours" },
    { path: APP_ROUTES.PROFILE, label: "👤 Mon Profil" },
    { path: APP_ROUTES.REFERRALS, label: "🤝 Parrainages" },
    { path: APP_ROUTES.SUBSCRIPTION, label: "💳 Abonnement" },
  ];

  return (
    <div className="sidebar">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;
