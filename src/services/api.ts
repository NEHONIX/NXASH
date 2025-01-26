import axios from "axios";
import { AUTH_SERVICES } from "./util/auth.service";
import { COURSES_SERVICES } from "./util/courses.service";
import { DASHBOARD_SERVICES } from "./util/dashboard.service";
import { STUDENTS_SERVICES } from "./util/students.service";
import { SCHEDULE_SERVICES } from "./util/schedule.service";
import { SETTINGS_SERVICES } from "./util/settings.service";
import { BASE_URL } from "./BASE_URL";

const API_URL = import.meta.env.VITE_API_URL || BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = AUTH_SERVICES;
export const dashboardService = DASHBOARD_SERVICES;
export const studentsService = STUDENTS_SERVICES;
export const scheduleService = SCHEDULE_SERVICES;
export const settingsService = SETTINGS_SERVICES;
export const coursesService = COURSES_SERVICES;

export default api;
