import { StudentLevel } from "./course";

// Types de base
export type Role = "student" | "instructor" | "admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type CourseStatus = "draft" | "published" | "archived";
export type ModuleType = "video" | "quiz" | "document" | "assignment";

// Interface pour le payload du token JWT
export interface ITokenPayload {
  uid: string;
  email: string;
  role: Role;
  matricule?: string;
  [key: string]: any;
}

interface referalT {
  code: string;
  status: ApprovalStatus;
}

// Interface pour l'utilisateur
export interface IUser {
  uid: string;
  name: string;
  picture?: string;
  email: string;
  phone: string;
  matricule: string;
  referal?: referalT | null;
  role: Role;
  approvalStatus: ApprovalStatus;
  // paymentStatus: ApprovalStatus;
  avatar?: string;
  bio?: string;
  specialty: StudentLevel;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les cours
export interface ICourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: CourseStatus;
  price: number;
  duration: number; // en heures
  level: "beginner" | "intermediate" | "advanced";
  requirements: string[];
  objectives: string[];
  rating: number;
  totalStudents: number;
  modules: string[]; // IDs des modules
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les modules
export interface IModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: ModuleType;
  content: {
    url?: string; // Pour les vidéos et documents
    duration?: number; // Pour les vidéos
    questions?: IQuizQuestion[]; // Pour les quiz
    assignment?: {
      instructions: string;
      deadline: Date;
      totalPoints: number;
    };
  };
  order: number;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les questions de quiz
export interface IQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  explanation?: string;
}

// Interface pour les progrès des étudiants
export interface IStudentProgress {
  userId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
  score?: number;
  timeSpent: number; // en secondes
  lastAccessedAt: Date;
}

// Interface pour les inscriptions aux cours
export interface ICourseEnrollment {
  userId: string;
  courseId: string;
  enrolledAt: Date;
  status: "active" | "completed" | "dropped";
  progress: number; // pourcentage de progression
  certificateId?: string;
}

// Interfaces pour les requêtes d'API
export interface ILoginRequest {
  matricule: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  specialty: StudentLevel;
  referralCode?: string;
}

// Interfaces pour les réponses d'API
export interface IAuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: IUser;
    loginInfo?: {
      matricule: string;
      message: string;
    };
  };
}

export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Interface pour les notifications
export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

// Interface pour les commentaires
export interface IComment {
  id: string;
  moduleId: string;
  userId: string;
  content: string;
  replies: IComment[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les certificats
export interface ICertificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: Date;
  grade: string;
  completionDate: Date;
  certificateUrl: string;
}

// Interface pour les emplois du temps
export interface ISchedule {
  id?: string;
  courseId: string;
  instructorId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
