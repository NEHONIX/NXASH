export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  nextScheduledCourse: boolean | null;
}
