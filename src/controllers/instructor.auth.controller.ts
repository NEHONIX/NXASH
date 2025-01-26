import { Request, Response, NextFunction } from "express";
import { firestore } from "../conf/firebase";
import { auth } from "../conf/firebase";
import ApiError from "../utils/ApiError";
import { generateToken } from "../utils/jwt.utils";
import {
  InstructorLoginDTO,
  InstructorRegistrationDTO,
  IInstructor,
} from "../types/instructor";
import { AuthenticatedRequest } from "../types/custom";
import { ITokenPayload } from "../types/model";
import { log } from "console";
import { cookieOption } from "../utils/cookieOption";

export class InstructorAuthController {
  static async register(
    req: Request<{}, {}, InstructorRegistrationDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, password, name, phone, specialties, qualifications, bio } =
        req.body;

      // //console.log(req.body);

      // Vérifier si l'email existe déjà
      const existingInstructor = await auth
        .getUserByEmail(email)
        .catch(() => null);
      if (existingInstructor) {
        throw new ApiError(400, "Un compte existe déjà avec cet email");
      }

      // Créer l'utilisateur dans Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // Créer le profil du professeur dans Firestore
      const instructorData: Omit<IInstructor, "uid"> = {
        email,
        name,
        role: "instructor",
        phone,
        specialties,
        qualifications,
        bio,
        ratings: {
          average: 0,
          count: 0,
        },
        stats: {
          totalStudents: 0,
          totalCourses: 0,
          completionRate: 0,
        },
        isActive: false, // nécessite validation par l'admin
        isQualified: false, // nécessite vérification des qualifications
        availability: {
          schedule: {},
          exceptions: [],
        },
        paymentInfo: {
          paypalEmail: "",
        },
        preferences: {
          notificationEmail: true,
          notificationSMS: false,
          language: "fr",
          timezone: "Europe/Paris",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await firestore
        .collection("instructors")
        .doc(userRecord.uid)
        .set(instructorData);

      res.status(201).json({
        success: true,
        message:
          "Compte professeur créé avec succès. En attente de validation.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(
    req: Request<{}, {}, InstructorLoginDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, password } = req.body;

      // Vérifier si l'utilisateur existe
      const user = await auth.getUserByEmail(email).catch(() => {
        throw new ApiError(401, "Email ou mot de passe incorrect");
      });

      // Vérifier si c'est bien un professeur
      const instructorDoc = await firestore
        .collection("instructors")
        .doc(user.uid)
        .get();

      if (!instructorDoc.exists) {
        throw new ApiError(403, "Ce compte n'est pas un compte professeur");
      }

      const instructorData = instructorDoc.data() as IInstructor;
      // //console.log(instructorData);
      // //console.log("isActive ?", instructorData.isActive);
      // //console.log("isQualified ?", instructorData.isQualified);

      // Vérifier si le compte est actif
      if (!instructorData.isActive) {
        throw new ApiError(403, "Votre compte est en attente de validation");
      }

      // Vérifier si les qualifications sont validées
      if (!instructorData.isQualified) {
        throw new ApiError(
          403,
          "Vos qualifications sont en cours de vérification"
        );
      }
      // //console.log("isActive question 2 ?", instructorData.isActive);
      // //console.log("isQualified  question 2 ?", instructorData.isQualified);

      // Générer le token JWT
      const token = await generateToken({
        uid: user.uid,
        email: user.email,
        role: "instructor",
      } as ITokenPayload);

      // log(token);
      // Mettre à jour la dernière connexion
      await instructorDoc.ref.update({
        lastLoginAt: new Date(),
      });

      // Définir le cookie
      res.cookie("instructorToken", token, cookieOption);

      res.status(200).json({
        success: true,
        message: "Connexion réussie",
        data: {
          instructor: {
            ...instructorData,
            uid: user.uid,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    // Supprimer le cookie
    res.clearCookie("instructorToken");

    res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
    });
  }

  static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const instructorDoc = await firestore
        .collection("instructors")
        .doc(req.user.uid)
        .get();

      if (!instructorDoc.exists) {
        throw new ApiError(404, "Profil professeur non trouvé");
      }

      const instructorData = instructorDoc.data() as IInstructor;

      res.status(200).json({
        success: true,
        message: "Profil récupéré avec succès",
        data: {
          ...instructorData,
          uid: req.user.uid,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const updateData = req.body;
      const instructorRef = firestore
        .collection("instructors")
        .doc(req.user.uid);

      // Champs non modifiables
      const protectedFields = [
        "uid",
        "email",
        "role",
        "isActive",
        "isQualified",
        "createdAt",
        "stats",
        "ratings",
      ];

      protectedFields.forEach((field) => {
        delete updateData[field];
      });

      await instructorRef.update({
        ...updateData,
        updatedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Profil mis à jour avec succès",
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkAuth(req: AuthenticatedRequest, res: Response) {
    const instructorDoc = await firestore
      .collection("instructors")
      .doc(req.user.uid)
      .get();

    if (!instructorDoc.exists) {
      throw new ApiError(404, "Profil professeur non trouvé");
    }

    const instructorData = instructorDoc.data() as IInstructor;

    res.status(200).json({
      success: true,
      message: "Utilisateur authentifié",
      data: {
        instructor: {
          ...instructorData,
          uid: req.user.uid,
        },
      },
    });
  }
}
