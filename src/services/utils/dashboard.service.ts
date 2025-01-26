import { DashboardResponse } from "../../types/dashboard";
import api from "../api";

export const DASHBOARD_SERVICE = {
  getStats: async (): Promise<DashboardResponse> => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await api.get("/dashboard/activities");
    return response.data;
  },

  getNextLesson: async () => {
    const response = await api.get("/dashboard/next-lesson");
    return response.data;
  },

  renewSubscription: async () => {
    const response = await api.post("/dashboard/subscription/renew");
    //console.log("Response for subs: ", response);
    return response.data;
  },
};
