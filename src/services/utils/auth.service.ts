import api from "../api";
import { API_ENDPOINTS } from "./endpoints/API_ENPOINTS";

export const AUTH_SERVICE = {
  register: async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const response = await api.post(
      API_ENDPOINTS.auth_service.REGISTER,
      userData
    );
    return response.data;
  },

  login: async (credentials: { matricule: string; password: string }) => {
    const response = await api.post(
      API_ENDPOINTS.auth_service.LOGIN,
      credentials
    );
    //console.log("Response: ", response);
    return response.data;
  },

  logout: async () => {
    await api.post(API_ENDPOINTS.auth_service.LOGOUT);
  },

  checkAuth: async () => {
    try {
      // Faites une requête GET vers l'endpoint "/auth/check-auth"
      const response = await api.get(API_ENDPOINTS.auth_service.CHECK_AUTH);
      //console.log("response:", response.data);
      return response.data;
    } catch (error: any) {
      //console.error("Erreur checkAuth:", error);
      if (error.response?.status === 429) {
        throw { status: 429, message: "Too Many Requests" };
      }
      return { data: null };
    }
  },

  getMe: async () => {
    const response = await api.get(API_ENDPOINTS.auth_service.PROFILE);
    return response.data;
  },
};
