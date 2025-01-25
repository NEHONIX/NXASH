import { Request, Response, NextFunction, RequestHandler } from "express";
import { firestore } from "../conf/firebase";
import ApiError from "../utils/ApiError";
import { AuthenticatedRequest } from "../types/custom";
import { verifyToken } from "../utils/jwt.utils";
import { IUser } from "../types/model"; // Importer le type IUser

export const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Récupérer le token depuis le cookie
    const token = req.cookies.authToken;

    if (!token) {
      throw new ApiError(401, "Token d'authentification manquant");
    }

    // Vérifier le token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new ApiError(401, "Token invalide ou expiré");
    }

    // Vérifier si l'utilisateur existe toujours dans Firestore
    const userDoc = await firestore.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      throw new ApiError(404, "Utilisateur non trouvé");
    }

    // Récupérer les données de l'utilisateur
    const userData = userDoc.data();

    // Vérifier si le compte est toujours approuvé
    if (userData?.approvalStatus !== "approved") {
      throw new ApiError(403, "Votre compte est en attente d'approbation");
    }

    // Ajouter les informations de l'utilisateur à la requête
    (req as AuthenticatedRequest).user = {
      ...userData,
      uid: decoded.uid,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    } as IUser;

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
      error: "Erreur d'authentification",
    });
  }
};
