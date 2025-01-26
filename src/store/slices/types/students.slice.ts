// Types de base
export type Role = "student" | "instructor" | "admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type CourseStatus = "draft" | "published" | "archived";
export type ModuleType = "video" | "quiz" | "document" | "assignment";

export interface IStudent {
  id: string;
  name: string;
  picture?: string;
  email: string;
  phone: string;
  matricule: string;
  role: Role;
  approvalStatus: ApprovalStatus;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalCourses: number;
    completedCourses: number;
    averageProgress: number;
    lastActive: string;
  };
}

interface StatT {
  totalStudents: number;
  activeStudents: number;
  averageCoursesPerStudent: number;
  averageCompletionRate: number;
}
interface ApiRes {
  stats: StatT;
  students: IStudent[];
  total: number;
}
export interface StudentsState {
  students: ApiRes;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}
