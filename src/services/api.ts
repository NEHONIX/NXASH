import axios from "axios";
// import { DashboardStats } from "../types/dashboard";
import { AUTH_SERVICE } from "./utils/auth.service";
import { COURSE_SERVICE } from "./utils/course.service";
import { BASE_URL_API } from "../api/baseUrl.api";
import { DASHBOARD_SERVICE } from "./utils/dashboard.service";
import { REFERRAL_SERVICE } from "./utils/referals.service";

const API_URL = BASE_URL_API({ isStudent: true });

// Création de l'instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // console.log("Error: ", error);
    if (error?.stats === 429) {
      window.location.href = "/429";
    }
    // if(error.code === "ECONNABORTED")
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = AUTH_SERVICE;

// Service des cours
export const courseService = COURSE_SERVICE;

// Service de parainages
export const referalServices = REFERRAL_SERVICE;

// Service du tableau de bord
export const dashboardService = DASHBOARD_SERVICE;
export default api;
