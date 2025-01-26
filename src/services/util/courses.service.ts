import { Course, CourseQuiz } from "@/types/course";
import api from "../api";
import { Chapter, Lesson } from "@/types/api";

export const COURSES_SERVICES = {
  // Récupérer tous les cours de l'instructeur
  getMyCourses: async () => {
    const response = await api.get("/courses");
    return response.data;
  },

  // Récupérer un cours par son ID
  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/get-by-id/${id}`);
    return response.data;
  },

  // Créer un nouveau cours
  createCourse: async (courseData: Course) => {
    const response = await api.post("/courses", courseData);
    return response.data;
  },

  // Créer un nouveau cours
  createLesson: async ({
    courseId,
    chapterId,
    data,
  }: {
    courseId: string;
    chapterId: string;
    data: Lesson;
  }) => {
    const response = await api.post(
      `/courses/${courseId}/chapters/${chapterId}/lessons`,
      data
    );
    return response.data;
  },

  // Créer un nouveau chapitre
  createChapter: async ({
    courseId,
    data,
  }: {
    courseId: string;
    data: Chapter;
  }) => {
    const response = await api.post(`/courses/${courseId}/chapters`, data);
    return response.data;
  },

  // Mettre à jour un cours
  updateCourse: async (id: string, courseData: Course) => {
    const response = await api.put(`/courses/update/${id}`, courseData);
    return response.data;
  },

  // Supprimer un cours
  deleteCourse: async (id: string) => {
    await api.delete(`/courses/${id}`);
    return true;
  },

  // Publier un cours
  publishCourse: async (id: string) => {
    const response = await api.post(`/courses/${id}/publish`);
    return response.data;
  },

  // Archiver un cours
  archiveCourse: async (id: string) => {
    const response = await api.post(`/courses/${id}/archive`);
    return response.data;
  },

  // Ajouter du contenu à un cours
  addContent: async (
    courseId: string,
    content: Omit<Course["content"][0], "id">
  ) => {
    const response = await api.post(`/courses/${courseId}/content`, content);
    return response.data;
  },

  // Mettre à jour l'ordre du contenu
  updateContentOrder: async (
    courseId: string,
    contentOrder: { id: string; order: number }[]
  ) => {
    const response = await api.patch(`/courses/${courseId}/content/order`, {
      contentOrder,
    });
    return response.data;
  },

  // Ajouter une ressource
  addResource: async (
    courseId: string,
    resource: Omit<Course["resources"][], "id">
  ) => {
    const response = await api.post(`/courses/${courseId}/resources`, resource);
    return response.data;
  },

  // Ajouter un quiz
  addQuiz: async (courseId: string, quiz: Omit<CourseQuiz, "id">) => {
    const response = await api.post(`/courses/${courseId}/quizzes`, quiz);
    return response.data;
  },
};
