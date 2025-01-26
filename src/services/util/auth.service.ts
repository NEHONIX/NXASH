import { LoginCredentials, RegisterData, UpdateProfileData } from "@/types/api";
import api from "../api";

export const AUTH_SERVICES = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  checkAuth: async () => {
    const response = await api.get("/auth/check-auth");
    //console.log(response.data.data);

    return response.data.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put("/auth/update-me", data);
    return response.data;
  },
};
