import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiUsers,
  FiCalendar,
  FiMessageSquare,
  FiSettings,
  FiMenu,
  FiX,
  FiCreditCard,
} from "react-icons/fi";
import "./Sidebar.scss";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { path: "/", icon: FiHome, label: "Tableau de bord" },
    { path: "/courses", icon: FiBook, label: "Mes cours" },
    { path: "/students", icon: FiUsers, label: "Mes étudiants" },
    { path: "/schedule", icon: FiCalendar, label: "Planning" },
    { path: "/messages", icon: FiMessageSquare, label: "Messages" },
    { path: "/settings", icon: FiSettings, label: "Paramètres" },
    { path: "/payments", icon: FiCreditCard, label: "Paiements" },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className={`sidebar-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      <aside
        className={`sidebar ${isOpen ? "open" : ""} ${
          isMobile ? "mobile" : ""
        }`}
      >
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={() => isMobile && setIsOpen(false)}
            >
              <item.icon className="icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {isOpen && isMobile && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
