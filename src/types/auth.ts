import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { StudentLevel } from "./course";

export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

export interface UserData {
  uid: string;
  email: string;
  role: "student" | "instructor";
  specialty?: StudentLevel;
  enrolledCourses?: string[];
  coursesProgress?: {
    [courseId: string]: {
      progress: number;
      lastAccessed: Date;
    };
  };
  subscriptionStatus?: "actif" | "inactif" | "en_attente";
  createdAt: Date;
  updatedAt: Date;
}
