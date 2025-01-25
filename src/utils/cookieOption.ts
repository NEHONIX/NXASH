import { CookieOptions } from "express";

export const cookieOption: CookieOptions = {
  httpOnly: true,
  secure: false, // En développement, on désactive secure
  sameSite: "lax", // En développement, on utilise lax
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
};

// Options pour la production
export const productionCookieOption: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
};
