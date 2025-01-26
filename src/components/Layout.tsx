import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "../styles/footer.scss";
import { useEffect } from "react";
import { AppDispatch } from "../store";
import { fetchDashboardStats } from "../store/slices/dashboardSlice";
import { useDispatch } from "react-redux";

export const Layout = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, []);

  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-container">
        <Sidebar />
        <main className="main-content" style={{ paddingBottom: "80px" }}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
