import { Request, Response } from "express";

// Types génériques pour différents types de réponses
interface BaseResponse {
  success: boolean;
  message?: string;
}

interface SuccessResponse<T = any> extends BaseResponse {
  data?: T;
  [key: string]: any; // Permet d'ajouter des propriétés supplémentaires dynamiquement
}

interface ErrorResponse extends BaseResponse {
  error?: any;
  info?: string;
}

export class ResponseHandler {
  private static checkHeadersSent(res: Response): boolean {
    if (res.headersSent) {
      console.warn(
        "Attempted to send response after headers were already sent"
      );
      return true;
    }
    return false;
  }

  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    additionalProps?: Record<string, any>,
    status: number = 200,
    statusCode?: { state: number }
  ) {
    if (this.checkHeadersSent(res)) return;

    const responseData: SuccessResponse<T> = {
      success: true,
      message,
      ...data,
      ...additionalProps,
    };

    return res.status(statusCode?.state || status).json(responseData);
  }

  static created<T>(
    res: Response,
    data?: T,
    message: string = "Ressource créée avec succès",
    additionalProps?: Record<string, any>
  ) {
    if (this.checkHeadersSent(res)) return;
    return this.success(res, data, message, additionalProps, 201);
  }

  static error(
    res: Response,
    error: any,
    status: number = 500,
    additionalProps?: Record<string, any>
  ) {
    if (this.checkHeadersSent(res)) return;

    const responseData: ErrorResponse = {
      success: false,
      info: "Une erreur inconnue s'est produite. Veuillez réessayer plus tard ou contacter le support si le problème persiste.",
      message:
        error instanceof Error ? error.message : "Une erreur est survenue",
      error: process.env.NODE_ENV === "production" ? undefined : error,
      ...additionalProps,
    };

    return res.status(status).json(responseData);
  }

  static notFound(
    res: Response,
    message: string = "Ressource non trouvée",
    additionalProps?: Record<string, any>
  ) {
    if (this.checkHeadersSent(res)) return;
    return this.error(res, { message }, 404, additionalProps);
  }

  static conflict(
    res: Response,
    message: string = "Opération non autorisée",
    additionalProps?: Record<string, any>
  ) {
    if (this.checkHeadersSent(res)) return;
    return this.error(res, { message }, 409, additionalProps);
  }

  static unauthorized(
    res: Response,
    message: string = "Non autorisé",
    additionalProps?: Record<string, any>
  ) {
    if (this.checkHeadersSent(res)) return;
    return this.error(res, { message }, 401, additionalProps);
  }

  static badRequest(
    res: Response,
    message: string = "Requête invalide",
    additionalProps?: Record<string, any>
  ) {
    if (this.checkHeadersSent(res)) return;
    return this.error(res, { message }, 400, additionalProps);
  }
}

// Middleware de gestion globale des erreurs
export const errorHandler = (err: any, _: Request, res: Response) => {
  //console.log"Erreur:", err);

  // Gestion des erreurs personnalisées avec status code
  if (err.status) {
    return ResponseHandler.error(res, err, err.status);
  }

  // Gestion des erreurs de validation
  if (err.name === "ValidationError") {
    return ResponseHandler.error(res, err, 422);
  }

  // Gestion des erreurs de base de données
  if (err.name === "MongoError" || err.name === "FirebaseError") {
    return ResponseHandler.error(res, err, 500);
  }

  // Erreur par défaut
  return ResponseHandler.error(res, err);
};
