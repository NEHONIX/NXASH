import api from "../api";

export const SETTINGS_SERVICES = {
  // Mettre à jour le profil de l'instructeur
  updateProfile: async (profileData: {
    name?: string;
    email?: string;
    phone?: string;
  }) => {
    const response = await api.patch("/profile", profileData);
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post("/profile/change-password", passwordData);
    return response.data;
  },

  // Récupérer les préférences de l'instructeur
  getPreferences: async () => {
    const response = await api.get("/profile/preferences");
    return response.data;
  },

  // Mettre à jour les préférences
  updatePreferences: async (preferences: any) => {
    const response = await api.patch("/profile/preferences", preferences);
    return response.data;
  }
};
