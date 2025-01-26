import api from "../api";

export const SCHEDULE_SERVICES = {
  // Récupérer les cours planifiés pour une semaine donnée
  getWeekSchedule: async (startDate: string, endDate: string) => {
    const response = await api.get(
      `/schedule?start=${startDate}&end=${endDate}`
    );
    //console.log(response);
    return response.data.data.schedules;
  },

  // Créer un nouveau cours planifié
  createScheduledCourse: async (scheduleData: {
    courseId: string;
    startTime: string;
    endTime: string;
    title: string;
    description?: string;
  }) => {
    const response = await api.post("/create-schedule", scheduleData);
    return response.data;
  },

  // Modifier un cours planifié
  updateScheduledCourse: async (
    id: string,
    scheduleData: {
      startTime?: string;
      endTime?: string;
      title?: string;
      description?: string;
    }
  ) => {
    const response = await api.patch(`/schedule/${id}`, scheduleData);
    return response.data;
  },

  // Supprimer un cours planifié
  deleteScheduledCourse: async (id: string) => {
    const response = await api.delete(`/schedule/${id}`);
    return response.data;
  },
};
