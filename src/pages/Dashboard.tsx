import { useSelector } from "react-redux";
import { StatCard } from "../components/dashboard/StatCard";
import { SubscriptionInfo } from "../components/dashboard/SubscriptionInfo";
import { formatFirestoreDate, formatDateToFr } from "../utils/dateUtils";
import { ProgressRing } from "../components/dashboard/ProgressRing";
import "../styles/dashboard.css";

// Importations des icônes Lucide
import {
  BookOpen,
  // CheckCircle2,
  // PlayCircle,
  TrendingUp,
  Calendar,
  Clock,
  MessageCircleWarning,
} from "lucide-react";
import { RootState } from "../store";

const Dashboard = () => {
  const { data, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { courses: courseData } = useSelector(
    (state: RootState) => state.courses
  );

  if (error) {
    return <div className="p-4 bg-red-50 text-red-800 rounded-lg">{error}</div>;
  }

  const stats = data?.stats;
  const totalCourses = courseData.length || 0;

  // //console.log("totalCourses: ", totalCourses);
  //console.log("courseData: ", data);

  //console.log("stats dash: ", stats);

  return (
    <div className="dashboard-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#000080" }}>
          Tableau de bord
        </h1>
      </div>

      <div className="stats-grid">
        {stats?.subscription?.warningMessage && (
          <StatCard
            textColor="red"
            title="Total des cours"
            value={stats?.subscription?.warningMessage || "Test"}
            loading={loading}
            icon={<MessageCircleWarning color="#FFA500" size={24} />}
          />
        )}
        <StatCard
          title="Total des cours"
          value={totalCourses}
          loading={loading}
          icon={<BookOpen color="#000080" size={24} />}
        />
        {/* <StatCard
          title="Cours complétés"
          value={stats?.completedCourses || 0}
          loading={loading}
          icon={<CheckCircle2 color="#000080" size={24} />}
        />
        <StatCard
          title="Cours en cours"
          value={stats?.inProgressCourses || 0}
          loading={loading}
          icon={<PlayCircle color="#000080" size={24} />}
        /> */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="title">Total des abonnements</h3>
            <TrendingUp color="#000080" size={24} />
          </div>
          <ProgressRing progress={stats?.subscription?.totalPaiements || 0} />
        </div>
      </div>

      <div className="info-grid">
        {/* Prochain cours programmé */}
        {stats?.nextScheduledCourse && (
          <div className="info-card">
            <h2>
              <Calendar className="inline-block mr-2" size={24} />
              Prochain cours
            </h2>
            <div className="info-list">
              <div className="info-item">
                <h3 className="font-medium text-gray-900">
                  {stats.nextScheduledCourse.title || "Sans titre"}
                </h3>
              </div>
              {stats.nextScheduledCourse.description && (
                <div className="info-item">
                  <p className="text-gray-600">
                    {stats.nextScheduledCourse.description}
                  </p>
                </div>
              )}
              <div className="info-item">
                <span className="label">Date de début</span>
                <span className="value flex items-center">
                  <Clock size={16} className="mr-2" />
                  {formatDateToFr(
                    formatFirestoreDate(stats.nextScheduledCourse.startTime)
                  )}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Date de fin</span>
                <span className="value flex items-center">
                  <Clock size={16} className="mr-2" />
                  {formatDateToFr(
                    formatFirestoreDate(stats.nextScheduledCourse.endTime)
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Informations d'abonnement */}
        {stats?.subscription && (
          <SubscriptionInfo
            subscription={stats.subscription}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
