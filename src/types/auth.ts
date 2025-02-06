import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { StudentLevel } from "./course";
import { FirestoreTimestamp } from "../utils/dateUtils";
import { ApprovalStatus } from "./model";
import { PaymentStatus } from "./payment";

export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

// export interface UserData {
//   uid: string;
//   email: string;
//   role: "student" | "instructor";
//   specialty?: StudentLevel;
//   enrolledCourses?: string[];
//   coursesProgress?: {
//     [courseId: string]: {
//       progress: number;
//       lastAccessed: Date;
//     };
//   };
//   subscriptionStatus?: "actif" | "inactif" | "en_attente";
//   createdAt: Date;
//   updatedAt: Date;
// }


export interface StudentInfos {
  id: string;
  uid: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  matricule: string;
  role: "student";
  createdAt: FirestoreTimestamp;
  approvalStatus: ApprovalStatus;
  paymentStatus: PaymentStatus;
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}