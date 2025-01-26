import { CookieOptions } from "express";

const isDevelopment = process.env.NODE_ENV === "development";

export const cookieOption: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

// Options pour la production
export const productionCookieOption: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
};
