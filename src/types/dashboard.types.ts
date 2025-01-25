export interface DashboardStats {
  coursesProgress: number;
  totalCourses: number;
  completedCourses: number;
  nextLesson: {
    title: string;
    date: string;
    time: string;
    courseId: string;
  } | null;
  referrals: number;
  subscription: {
    status: "Actif" | "Inactif" | "En attente";
    nextPayment: string;
  };
  recentActivities: Array<{
    id: string;
    type: "course_completed" | "quiz_completed" | "course_unlocked" | "other";
    title: string;
    timestamp: string;
  }>;
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
