import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchDashboardStats } from "@/store/slices/dashboardSlice";
import { fetchCourses as fetchMyCourses } from "@/store/slices/courseSlice";
import StatCard from "./components/StatCard";
import RecentActivity from "./components/RecentActivity";
import UpcomingLessons from "./components/UpcomingLessons";
import "./Dashboard.scss";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state: RootState) => {
    //console.log("Current dashboard state:", state.dashboard);
    return state.dashboard;
  });
  const { students: studentDatas } = useSelector(
    (state: RootState) => state.students
  );

  useEffect(() => {
    //console.log("Dashboard mounted, dispatching actions...");
    const fetchData = async () => {
      try {
        //console.log("Fetching courses...");
        await dispatch(fetchMyCourses() as any);
        //console.log("Fetching dashboard stats...");
        await dispatch(fetchDashboardStats() as any);
        //console.log("Dashboard stats fetch result:", result);
      } catch (err) {
        //console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, [dispatch]);

  //console.log("Dashboard render - Current stats:", stats);
  //console.log("Dashboard render - Loading:", loading);
  //console.log("Dashboard render - Error:", error);

  const statCards = [
    {
      title: "Cours actifs",
      value: stats.totalCourses,
      icon: "📚",
      color: "blue" as const,
    },
    {
      title: "Cours publiés",
      value: stats.publishedCourses,
      icon: "✔",
      color: "green" as const,
    },
    {
      title: "Cours en cours de rédaction",
      value: stats.draftCourses,
      icon: "📝",
      color: "orange" as const,
    },
    {
      title: "Étudiants actifs",
      value: studentDatas.total,
      icon: "👥",
      color: "green" as const,
    },
    {
      title: "Taux de complétion",
      value: `Bientôt`,
      icon: "📈",
      color: "purple" as const,
    },
    {
      title: "Heures enseignées",
      value: `bientôt`,
      icon: "⏰",
      color: "orange" as const,
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="dashboard-error">
  //       <p>Une erreur est survenue lors du chargement des données.</p>
  //       <button onClick={() => dispatch(fetchDashboardStats() as any)}>
  //         Réessayer
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="dashboard">
      <h1>Tableau de bord</h1>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-col">
          <UpcomingLessons />
        </div>
        <div className="dashboard-col">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
