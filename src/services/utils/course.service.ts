import api from "../api";
import { API_ENDPOINTS } from "./endpoints/API_ENPOINTS";

export const COURSE_SERVICE = {
  getAllCourses: async () => {
    const response = await api.get(API_ENDPOINTS.courseService.getAllCourses);
    //console.log("Course datas", response.data.data.courses);
    return response.data.data.courses;
  },

  getCourseById: async (id: string) => {
    const response = await api.get(
      API_ENDPOINTS.courseService.getCourseById(id)
    );
    return response.data;
  },

  enrollCourse: async (courseId: string) => {
    const response = await api.post(
      API_ENDPOINTS.courseService.enrolleCourse(courseId)
    );
    return response.data;
  },

  getEnrolledCourses: async () => {
    const response = await api.get(API_ENDPOINTS.courseService.enrolledCourses);
    return response.data;
  },
};
