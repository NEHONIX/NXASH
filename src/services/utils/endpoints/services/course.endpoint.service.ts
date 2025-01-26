export const COURSE_SERVICE_ENDPOINT = {
  //Obtenir toutes les cours
  getAllCourses: "/courses/getAll",
  //Obtenir les cours par id
  getCourseById: (id: string) => `/courses/${id}`,

  //S'inscrire au cours
  enrolleCourse: (courseId: string) => `/courses/${courseId}/enroll`,

  //Obtenir les cours inscrits
  enrolledCourses: `/courses/enrolled`,
  //Terminer un cours
  completeLesson: (courseId: string, moduleId: string, lessonId: string) =>
    `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/complete`,
};
