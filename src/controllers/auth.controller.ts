import { Request, Response, NextFunction } from "express";
import { admin, firestore } from "../conf/firebase";
import {
  IUser,
  ILoginRequest,
  IRegisterRequest,
  ITokenPayload,
} from "../types/model";
import ApiError from "../utils/ApiError";
import { generateMatricule } from "../utils/generate_matricule";
import { AuthenticatedRequest } from "../types/custom";
import { cookieOption, productionCookieOption } from "../utils/cookieOption";
import { generateToken } from "../utils/jwt.utils";
import { UAParser } from "ua-parser-js"; // Corriger l'import
import jwt from "jsonwebtoken";
import {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
} from "../utils/sendMail";
import { nanoid } from "nanoid";
import { FORMATION_PRICES } from "../types/payment";
import { filepath, readCache, writeCache } from "../utils/cache/server.cache";
// import ServerCaches from "../utils/cache/server.cache.ts.draft";

interface CachedRegistrationData {
  timestamp: number;
  deviceFingerprint: string;
  registrationStatus: "success" | "failed";
  message?: string;
  data?: any;
}

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: IRegisterRequest = req.body;
      const referalCode = userData?.referralCode;
      const userAgent = req.headers["user-agent"];
      const parser = new UAParser(userAgent);
      // const filepath = "cache/user/register.txt";
      const path = "/user/register.txt";

      // const cacheManager = new ServerCaches({
      //   filepath: cacheFilePath,
      // });
      // const readCache = cacheManager.readCache;
      // const writeCache = cacheManager.writeCache;

      // Configuration du TTL (Time To Live) pour le cache
      const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

      // Convertir les données en objets simples
      const deviceInfo = {
        browser: {
          name: parser.getBrowser().name || "Inconnu",
          version: parser.getBrowser().version || "Inconnu",
        },
        device: {
          model: parser.getDevice().model || "Inconnu",
          type: parser.getDevice().type || "Inconnu",
          vendor: parser.getDevice().vendor || "Inconnu",
        },
        os: {
          name: parser.getOS().name || "Inconnu",
          version: parser.getOS().version || "Inconnu",
        },
      };

      // Créer une empreinte unique de l'appareil
      const deviceFingerprint = Buffer.from(
        JSON.stringify({
          ...deviceInfo,
          ip: req.ip,
        })
      ).toString("base64");

      // Lecture et validation du cache
      const cachedData = readCache(filepath(path));

      if (cachedData?.device_registrations) {
        const registrationData: CachedRegistrationData =
          cachedData.device_registrations[deviceFingerprint];

        if (
          registrationData &&
          Date.now() - registrationData.timestamp < CACHE_TTL
        ) {
          // Si les données sont encore valides
          if (registrationData.registrationStatus === "failed") {
            throw new ApiError(
              400,
              registrationData.message || "Registration blocked"
            );
          }
          return res.json(registrationData.data);
        } else if (registrationData) {
          // Supprimer les données expirées
          delete cachedData.device_registrations[deviceFingerprint];
          writeCache({
            data: cachedData,
            filepath: filepath(path),
          });
        }
      }

      // Vérifier si cet appareil a déjà été utilisé pour une inscription
      const existingDeviceDoc = await firestore
        .collection("device_registrations")
        .where("fingerprint", "==", deviceFingerprint)
        .get();

      if (!existingDeviceDoc.empty) {
        // Marquer la tentative suspecte
        await firestore.collection("suspicious_attempts").add({
          type: "multiple_device_registration",
          deviceFingerprint,
          attemptedData: {
            email: userData.email,
            phone: userData.phone,
          },
          timestamp: new Date(),
          ip: req.ip,
          deviceInfo,
        });

        throw new ApiError(
          400,
          "Une inscription a déjà été effectuée depuis cet appareil. Veuillez contacter l'administration."
        );
      }

      // Validation des données
      if (!userData.email || !userData.password || !userData.name) {
        throw new ApiError(400, "Veuillez fournir tous les champs requis");
      }

      // Formater le numéro de téléphone pour Firebase Auth (E.164 format)
      const phoneNumber = userData.phone?.startsWith("+")
        ? userData.phone
        : userData.phone
        ? `+225 ${userData.phone.replace(/\D/g, "")}`
        : undefined;

      if (!phoneNumber) {
        throw new ApiError(400, "Le numéro de téléphone est requis");
      }

      // Vérifier si le numéro de téléphone existe déjà
      const phoneExists = await firestore
        .collection("users")
        .where("phone", "==", phoneNumber)
        .get();

      if (!phoneExists.empty) {
        // Marquer la tentative suspecte
        await firestore.collection("suspicious_attempts").add({
          type: "duplicate_phone",
          phone: phoneNumber,
          attemptedData: {
            email: userData.email,
            deviceFingerprint,
          },
          timestamp: new Date(),
          ip: req.ip,
          deviceInfo,
        });

        throw new ApiError(
          400,
          "Ce numéro de téléphone est déjà utilisé. Si c'est votre numéro, veuillez contacter l'administration."
        );
      }

      // Vérifier si l'utilisateur existe déjà
      const userExists = await firestore
        .collection("users")
        .where("email", "==", userData.email)
        .get();

      if (!userExists.empty) {
        // Marquer la tentative suspecte
        await firestore.collection("suspicious_attempts").add({
          type: "duplicate_email",
          email: userData.email,
          attemptedData: {
            phone: phoneNumber,
            deviceFingerprint,
          },
          timestamp: new Date(),
          ip: req.ip,
          deviceInfo,
        });

        throw new ApiError(400, "Un utilisateur avec cet email existe déjà");
      }

      try {
        // Créer l'utilisateur dans Firebase Auth
        const userRecord = await admin.auth().createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.name,
          phoneNumber: phoneNumber,
        });

        // Générer le matricule
        const matricule = await generateMatricule();

        // Créer le document utilisateur dans Firestore
        const user: IUser = {
          uid: userRecord.uid,
          name: userData.name,
          specialty: userData.specialty || "L1", // Valeur par défaut si non spécifiée
          email: userData.email,
          phone: phoneNumber,
          matricule: matricule,
          referal: referalCode
            ? {
                code: referalCode,
                status: "pending",
              }
            : null,
          role: "student",
          approvalStatus: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await firestore.collection("users").doc(userRecord.uid).set(user);

        // Enregistrer l'appareil utilisé pour l'inscription
        await firestore.collection("device_registrations").add({
          fingerprint: deviceFingerprint,
          userId: userRecord.uid,
          deviceInfo: deviceInfo, // Utiliser l'objet converti
          registeredAt: new Date(),
          ip: req.ip,
          phone: phoneNumber,
          email: userData.email,
        });
        const tokenD: ITokenPayload = {
          uid: userRecord.uid,
          email: userData.email,
          phone: phoneNumber,
          role: "student",
          matricule: matricule,
          deviceInfo: deviceInfo,
        };

        const paymentToken = await generateToken(tokenD, {
          TOKEN_EXPIRY: "24h",
        });

        // Envoyer l'email de bienvenue
        await sendWelcomeEmail(user);

        const successRegistration: CachedRegistrationData = {
          timestamp: Date.now(),
          deviceFingerprint,
          registrationStatus: "success",
          data: {
            success: true,
            message: "Inscription réussie",
            data: {
              infos: "Ce token de paiement est valide pour 24h",
              paymentToken,
              user,
              loginInfo: {
                matricule,
                message:
                  "Conservez votre matricule, il sera nécessaire pour la connexion",
              },
            },
          },
        };

        writeCache({
          data: {
            device_registrations: {
              [deviceFingerprint]: successRegistration,
            },
          },
          filepath: filepath(path),
        });

        //Envoie de la response si tout est ok (Je vais ici)
        //envoyer une reponse contenant les métas données utile
        //pour l'inscription
        res.status(201).json({
          success: true,
          message: "Inscription réussie",
          data: {
            infos: "Ce token de paiement est valide pour 24h",
            paymentToken,
            user,
            loginInfo: {
              matricule,
              message:
                "Conservez votre matricule, il sera nécessaire pour la connexion",
            },
          },
        });
      } catch (error: any) {
        if (error.code === "auth/invalid-phone-number") {
          throw new ApiError(
            400,
            "Le numéro de téléphone n'est pas valide. Utilisez le format international (ex: +225XXXXXXXXX)"
          );
        }
        //console.error("Erreur lors de la création de l'utilisateur:", error);
        throw new ApiError(500, "Erreur lors de la création du compte");
      }
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { matricule, password }: ILoginRequest = req.body;
      console.log({ matricule, password });
      if (!matricule || !password) {
        throw new ApiError(
          400,
          "Veuillez fournir le matricule et le mot de passe"
        );
      }

      const userSnapshot = await firestore
        .collection("users")
        .where("matricule", "==", matricule)
        .get();

      if (userSnapshot.empty) {
        throw new ApiError(401, "Matricule invalide");
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data() as IUser;

      try {
        const userCredential = await admin
          .auth()
          .getUserByEmail(userData.email);

        // Générer le token dans tous les cas
        const token = await generateToken(userData);

        // //console.log("token: ", token)
        // Initialiser le parser
        const parser = new UAParser(req.headers["user-agent"]);

        // Envoyer l'email de notification de connexion
        await sendLoginNotificationEmail(
          userData,
          {
            browser: parser.getBrowser(),
            os: parser.getOS(),
          },
          req.ip!,
          "NXSAH"
        );

        // Vérifier si le compte nécessite un paiement
        if (userData.approvalStatus !== "approved") {
          // Créer une session de paiement
          const paymentRef = `PAY-${nanoid(8)}`;
          const paymentSession = {
            id: paymentRef,
            userId: userDoc.id,
            studentEmail: userData.email,
            amount: FORMATION_PRICES[userData.specialty],
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              studentName: userData.name,
              studentMatricule: userData.matricule,
              formationLevel: userData.specialty,
            },
          };

          // Sauvegarder la session de paiement
          // await firestore
          //   .collection("payment_sessions")
          //   .doc(paymentRef)
          //   .set(paymentSession);

          // Retourner le token avec les informations de paiement
          return res.status(200).json({
            success: true,
            message: "Connexion réussie - Paiement requis",
            data: {
              token,
              user: userData,
              requiresPayment: true,
              paymentSession: {
                paymentRef,
                amount: FORMATION_PRICES[userData.specialty],
                studentEmail: userData.email,
                formationLevel: userData.specialty,
              },
            },
          });
        }

        res.cookie("authToken", token, cookieOption);
        // Si le compte est déjà approuvé, retourner simplement le token
        res.status(200).json({
          success: true,
          message: "Connexion réussie",
          data: {
            token,
            user: userData,
            requiresPayment: false,
          },
        });
      } catch (error) {
        throw new ApiError(401, "Identifiants invalides");
      }
    } catch (error) {
      console.log(error)
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("authToken", cookieOption);
      res.status(200).json({
        success: true,
        message: "Déconnexion réussie",
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userDoc = await firestore
        .collection("users")
        .doc(req.user.uid)
        .get();

      if (!userDoc.exists) {
        throw new ApiError(404, "Utilisateur non trouvé");
      }

      const userData = userDoc.data() as IUser;

      res.status(200).json({
        success: true,
        message: "Utilisateur authentifié",
        data: {
          user: userData,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
