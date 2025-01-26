export type SubscriptionStatus = "actif" | "inactif" | "en_attente";

export interface DashboardSubscriptionInfo {
  id: string;
  status: SubscriptionStatus;
  warningMessage: string | null;
  montantMensuel: number;
  specialty: string;
  dateDebut: {
    _seconds: number;
    _nanoseconds: number;
  };
  prochainPaiement: {
    _seconds: number;
    _nanoseconds: number;
  };
  dernierPaiement: {
    paymentRef: string;
    montant: number;
    datePaiement: {
      _seconds: number;
      _nanoseconds: number;
    };
    status: string;
    methode: string;
  } | null;
  totalPaiements: number;
  paiementsReussis: number;
}

export interface DashboardScheduleData {
  id: string;
  courseId: string;
  startTime: {
    _seconds: number;
    _nanoseconds: number;
  };
  endTime: {
    _seconds: number;
    _nanoseconds: number;
  };
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

export interface UserData {
  uid: string;
  email: string;
  role: "student" | "instructor";
  level?: "beginner" | "intermediate" | "advanced";
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
