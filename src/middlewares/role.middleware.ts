import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/custom";
import ApiError from "../utils/ApiError";

export const isInstructor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user.role !== "instructor") {
      throw new ApiError(403, "Accès réservé aux professeurs");
    }
    next();
  } catch (error) {
    next(error);
  }
};
