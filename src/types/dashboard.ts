import { SubscriptionStatus } from "./subscription";
import { UserData } from "./auth";

export interface DashboardSubscriptionInfo {
  id: string;
  status: SubscriptionStatus;
  montantMensuel: number;
  specialty: string;
  dateDebut: Date;
  prochainPaiement: Date;
  dernierPaiement: {
    paymentRef: string;
    montant: number;
    datePaiement: Date;
    status: string;
    methode: string;
  } | null;
  totalPaiements: number;
  paiementsReussis: number;
}

export interface DashboardScheduleData {
  id: string;
  courseId: string;
  startTime: Date;
  endTime: Date;
  title?: string;
  description?: string;
}

export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  nextScheduledCourse: DashboardScheduleData | null;
  subscription: DashboardSubscriptionInfo | null;
  subscriptionStatus: SubscriptionStatus | "inactif";
}

export interface DashboardData {
  stats: DashboardStats;
  student: {
    id: string;
  } & UserData;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
  warningMessage: string | null;
}

export interface Activity {
  id: string;
  userId: string;
  type: "course_completed" | "quiz_completed" | "course_unlocked" | "other";
  title: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface NextLesson {
  title: string;
  date: string;
  time: string;
  courseId: string;
  courseName: string; 
  instructorName: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  status: "pending" | "completed";
  createdAt: Date;
  completedAt?: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  status: "Actif" | "Inactif" | "En attente";
  startDate: Date;
  endDate: Date;
  nextPayment: Date;
  plan: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}
