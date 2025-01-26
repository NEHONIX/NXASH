import { CookieOptions } from "express";

const isDevelopment = process.env.NODE_ENV === "development";

export const cookieOption: CookieOptions = {
  httpOnly: true,
  secure: !isDevelopment,
  sameSite: isDevelopment ? "lax" : "none",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
};

// Options pour la production
export const productionCookieOption: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
};
