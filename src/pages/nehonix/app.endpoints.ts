const COURSE_DETAIL_FN = (courseId: string) =>
  `/nehonix/previews/type/courses/${courseId}`;

export const APP_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PENDING_APPROVAL: "/pending-approval",
  REJECTED_ACCOUNT: "/rejected",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  REGISTRATION_SUCCESS: "/registration-success",
  PROFILE: "/profile",
  COURSES: "/courses",
  REFERRALS: "/referrals",
  SUBSCRIPTION: "/subscription",
  PAYMENT: "/nehonix/secure-payment",
  PENDING_PAYMENT: "/nehonix/pending-payment",
  NOT_FOUND: "/nehonix/not-found",
  COURSE_DETAIL: COURSE_DETAIL_FN,
} as const;
