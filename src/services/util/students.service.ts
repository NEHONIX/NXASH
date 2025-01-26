import api from "../api";

export const STUDENTS_SERVICES = {
  // Récupérer tous les étudiants
  getStudents: async () => {
    const response = await api.get("/students");
    // //console.log("students: ", response.data);
    return response.data.data;
  },

  // Récupérer un étudiant par son ID
  getStudentById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Rechercher des étudiants
  searchStudents: async (query: string) => {
    const response = await api.get(`/students/search?q=${query}`);
    return response.data;
  },

  // Mettre à jour le statut d'un étudiant
  updateStudentStatus: async (id: string, status: string) => {
    const response = await api.patch(`/students/${id}/status`, { status });
    return response.data;
  },
};
