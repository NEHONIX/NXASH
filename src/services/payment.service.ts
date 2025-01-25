import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { firestore } from "../conf/firebase";
import {
  PaymentSession,
  PayUnitConfig,
  PayUnitResponse,
} from "../types/payment";
import { StudentLevel } from "../types/course";
import { FORMATION_PRICES } from "../types/payment";
import ApiError from "../utils/ApiError";

class PaymentService {
  private config: PayUnitConfig;
  private baseUrl: string;
  private authHeader: string;

  constructor() {
    const mode = (process.env.PAYUNIT_MODE || "test") as "test" | "live";
    const apiKey = process.env.PAYUNIT_API_KEY || "";
    const apiSecret = process.env.PAYUNIT_API_SECRET || "";
    const appToken = process.env.PAYUNIT_APP_ID || "";

    // Création du header d'authentification Basic
    const authString = `${apiKey}:${apiSecret}`;
    this.authHeader = `Basic ${Buffer.from(authString).toString("base64")}`;

    this.config = {
      apiKey: apiKey,
      apiSecret: apiSecret,
      appToken: appToken,
      callbackUrl: `${process.env.API_BASE_URL}/api/public/v1/payments/webhook`,
      returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
      mode: mode,
    };

    this.baseUrl = "https://gateway.payunit.net";
  }

  async createPaymentSession(
    userId: string,
    specialty: StudentLevel,
    studentData: {
      name: string;
      email: string;
      phone: string;
    }
  ): Promise<PaymentSession> {
    try {
      const amount = FORMATION_PRICES[specialty];

      if (!amount) {
        throw new ApiError(400, "Spécialité non valide");
      }

      if (!process.env.API_BASE_URL || !process.env.FRONTEND_URL) {
        throw new ApiError(500, "Configuration des URLs manquante");
      }

      // //console.log("Tentative de création de paiement avec les données:", {
      //   amount,
      //   currency: "XAF",
      //   returnUrl: this.config.returnUrl,
      //   notifyUrl: this.config.callbackUrl,
      //   mode: this.config.mode,
      //   apiKey: this.config.apiKey,
      // });

      // Créer la session dans PayUnit
      const payunitResponse = await axios.post<PayUnitResponse>(
        `${this.baseUrl}/api/gateway/initialize`,
        {
          total_amount: amount,
          currency: "XAF",
          transaction_id: `NEH-${uuidv4().slice(0, 8)}`,
          return_url: this.config.returnUrl,
          notify_url: this.config.callbackUrl,
          payment_country: "CM",
          description: `NEHONIX - Formation ${specialty}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: this.authHeader,
            "x-api-key": this.config.appToken,
            mode: this.config.mode,
          },
        }
      );

      //console.log("Réponse PayUnit:", payunitResponse.data);

      if (payunitResponse.data.status !== "SUCCESS") {
        throw new Error(payunitResponse.data.message || "Erreur PayUnit");
      }

      // Créer la session de paiement dans Firestore
      const paymentSession: PaymentSession = {
        id: payunitResponse.data.data.transaction_id,
        userId,
        amount,
        specialty,
        paymentUrl: payunitResponse.data.data.transaction_url,
        status: "pending",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expire dans 24h
        currency: "XAF",
        metadata: {
          studentName: studentData.name,
          studentEmail: studentData.email,
          studentPhone: studentData.phone,
          formationLevel: specialty,
        },
      };

      await firestore
        .collection("payment_sessions")
        .doc(paymentSession.id)
        .set(paymentSession);

      return paymentSession;
    } catch (error: any) {
      // console.error(
      //   "Erreur création session de paiement:",
      //   error.response?.data || error.message
      // );
      throw new ApiError(
        500,
        "Impossible de créer la session de paiement: " +
          (error.response?.data.message || error.message)
      );
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      const { transaction_id, status } = payload;

      if (!transaction_id || !status) {
        throw new Error("Payload webhook invalide");
      }

      const paymentRef = firestore
        .collection("payment_sessions")
        .doc(transaction_id);

      const paymentDoc = await paymentRef.get();

      if (!paymentDoc.exists) {
        throw new Error("Session de paiement non trouvée");
      }

      const payment = paymentDoc.data() as PaymentSession;

      // Mettre à jour le statut du paiement
      await paymentRef.update({
        status: status === "SUCCESSFUL" ? "completed" : "failed",
        updatedAt: new Date(),
      });

      // Si le paiement est réussi, activer la formation
      if (status === "SUCCESSFUL") {
        await firestore.collection("users").doc(payment.userId).update({
          level: payment.specialty,
          paymentStatus: "completed",
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      //console.error("Erreur traitement webhook:", error);
      throw error;
    }
  }

  async getPaymentSession(sessionId: string): Promise<PaymentSession> {
    const doc = await firestore
      .collection("payment_sessions")
      .doc(sessionId)
      .get();

    if (!doc.exists) {
      throw new ApiError(404, "Session de paiement non trouvée");
    }

    return doc.data() as PaymentSession;
  }
}

export const paymentService = new PaymentService();
