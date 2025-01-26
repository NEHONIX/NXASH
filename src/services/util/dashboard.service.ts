import api from "../api";
import { ScheduleResponse } from "@/types/dashboard";

export const DASHBOARD_SERVICES = {
  getStats: async () => {
    try {
      const response = await api.get("/stats");
      //console.log("Réponse brute de l'API:", response);
      return (
        response.data?.data.stats || {
          totalCourses: 0,
          publishedCourses: 0,
          draftCourses: 0,
          totalStudents: 0,
          totalRevenue: 0,
          averageRating: 0,
          completionRate: 0,
        }
      );
    } catch (error) {
      //console.error("Erreur lors de la récupération des stats:", error);
      throw error;
    }
  },

  getUpcomingLessons: async () => {
    try {
      const response = await api.get<{ data: ScheduleResponse }>(
        "/schedules/upcoming"
      );
      //console.log("Réponse des prochains cours:", response.data);

      // Transformer les données pour correspondre à l'interface attendue
      const upcomingLessons = response.data.data.schedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        description: schedule.description,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        courseName: schedule.course.title,
        courseImage: schedule.course.thumbnail,
        status: "À venir",
      }));

      //console.log("Upcoming responses: ", upcomingLessons);

      return upcomingLessons;
    } catch (error) {
      // console.error(
      //   "Erreur lors de la récupération des prochaines leçons:",
      //   error
      // );
      return [];
    }
  },

  getRecentActivities: async () => {
    try {
      const response = await api.get("/activities/recent");
      return response.data?.data || [];
    } catch (error) {
      // console.error(
      //   "Erreur lors de la récupération des activités récentes:",
      //   error
      // );
      return [];
    }
  },
};
