export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  specialties: string[];
  qualifications: string[];
  bio: string;
}

export interface UserPreferences {
  notificationEmail?: boolean;
  notificationSMS?: boolean;
  language?: string;
  timezone?: string;
}

export interface PaymentInfo {
  paypalEmail?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  specialties?: string[];
  qualifications?: string[];
  preferences?: UserPreferences;
  paymentInfo?: PaymentInfo;
}

export interface CreateCourseData {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  duration: number;
  level: "beginner" | "intermediate" | "advanced";
  requirements: string[];
  objectives: string[];
}

export interface UpdateCourseData extends Partial<CreateCourseData> {}

export interface Chapter {
  title: string;
  description: string;
  order: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  explanation?: string;
}

export interface Assignment {
  instructions: string;
  deadline: Date;
  totalPoints: number;
}

export interface Lesson {
  title: string;
  description: string;
  type: "video" | "quiz" | "document" | "assignment";
  content: {
    url?: string;
    duration?: number;
    questions?: QuizQuestion[];
    assignment?: Assignment;
  };
  order: number;
  isRequired: boolean;
}

export interface UserT {
  id: string;
  email: string;
  name: string;
  phone: string;
  specialties: string[];
  qualifications: string[];
  bio: string;
  preferences: UserPreferences;
  paymentInfo: PaymentInfo;
  createdAt: string;
  updatedAt: string;
}
export type User = {
  instructor: UserT;
};
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  duration: number;
  level: "beginner" | "intermediate" | "advanced";
  requirements: string[];
  objectives: string[];
  status: "draft" | "published";
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}
