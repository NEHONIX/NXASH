import { Request, Response, NextFunction, RequestHandler } from "express";
import { firestore } from "../conf/firebase";
import ApiError from "../utils/ApiError";
import { AuthenticatedRequest } from "../types/custom";
import { verifyToken } from "../utils/jwt.utils";
import { IInstructor } from "../types/instructor";

export const instructorAuthMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Récupérer le token depuis le cookie
    const token = req.cookies.instructorToken;

    if (!token) {
      throw new ApiError(401, "Token d'authentification professeur manquant");
    }

    // Vérifier le token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new ApiError(401, "Token professeur invalide ou expiré");
    }

    // Vérifier si le professeur existe toujours dans Firestore
    const instructorDoc = await firestore.collection("instructors").doc(decoded.uid).get();

    if (!instructorDoc.exists) {
      throw new ApiError(404, "Professeur non trouvé");
    }

    // Récupérer les données du professeur
    const instructorData = instructorDoc.data();

    // Vérifier si le compte est actif
    if (!instructorData?.isActive) {
      throw new ApiError(403, "Votre compte professeur est désactivé");
    }

    // Vérifier les qualifications
    if (!instructorData?.isQualified) {
      throw new ApiError(403, "Vos qualifications n'ont pas encore été validées");
    }

    // Ajouter les informations du professeur à la requête
    (req as AuthenticatedRequest).user = {
      ...instructorData,
      uid: decoded.uid,
      role: "instructor",
    } as IInstructor;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: "Erreur d'authentification professeur",
    });
  }
};
