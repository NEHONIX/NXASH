import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { APP_ASSETS } from "../nehonix/assets/APP_ASSETS";
import { APP_ROUTES } from "./nehonix/app.endpoints";
import { decodeData, encodeData } from "../utils/encryption";
import PaymentModal from "../components/PaymentModal";
// import "../styles/auth.scss";
import "../styles/modal.scss";
import { paymentService } from "../api/payment.api";

interface PaymentData {
  u: string; // nom
  e: string; // email
  m: string; // matricule
  s: string; // spécialité
  t: string; // token de paiement
  a: number; // montant
  ref?: string; // référence de paiement
}

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<
    "orange" | "mtn" | "moov" | null
  >(null);

  useEffect(() => {
    const encodedData = searchParams.get("data");
    if (!encodedData) {
      navigate(APP_ROUTES.REGISTER, { replace: true });
      return;
    }

    const decodedData = decodeData(encodedData);

    if (!decodedData) {
      setError("Données de paiement invalides");
      return;
    }

    setPaymentData(decodedData);
  }, [searchParams, navigate]);

  /**
   * Gère la soumission du paiement pour tous les moyens de paiement
   * @param phoneNumber - Le numéro de téléphone de l'utilisateur
   * @param otp - Le code de confirmation pour Orange Money (optionnel)
   * @returns Promise<boolean> - true si l'opération réussit, false sinon
   */
  const handlePaymentSubmit = async (
    phoneNumber: string,
    otp?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      // Gestion spécifique pour Orange Money
      if (currentPaymentMethod === "orange") {
        if (otp) {
          // Étape 2: Vérification du code Orange Money
          const response = await paymentService.verifyOrangeCode(
            paymentData?.ref || "",
            otp
          );

          if (response.success || response.status) {
            // Si le code est valide, on redirige vers la page d'attente
            const verificationData = {
              ref: response.paymentRef || paymentData?.ref, // Utiliser la nouvelle référence ou garder l'ancienne
              t: paymentData?.t, // Token pour l'authentification
            };
            const encodedData = encodeData(verificationData);
            navigate(
              `${APP_ROUTES.PENDING_PAYMENT}?data=${encodedData}&provider=${currentPaymentMethod}`,
              { replace: true }
            );
            return true;
          } else {
            setError(response.message || "Code de vérification incorrect");
            return false;
          }
        } else {
          // Étape 1: Initialisation du paiement Orange Money
          const paymentRequest = {
            paymentToken: paymentData?.t || "",
            paymentData: {
              amount: paymentData?.a || 0,
              paymentPhoneNumber: phoneNumber,
              paymentMethod: currentPaymentMethod,
            },
          };

          // Envoyer la demande d'initialisation
          const response = await paymentService.initializePayment(
            paymentRequest
          );
          //console.log("response init orange: ", response);

          if (response.success || response.status) {
            // Stocker la référence de paiement pour la vérification ultérieure
            setPaymentData((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                ref: response?.paymentRef || "",
                u: prev.u,
                e: prev.e,
                m: prev.m,
                s: prev.s,
                t: prev.t,
                a: prev.a,
              };
            });
            setError("");
            return true;
          } else {
            setError(
              response.message || "Erreur lors de l'initialisation du paiement"
            );
            return false;
          }
        }
      } else {
        // Gestion pour MTN Money et Moov Money
        const paymentRequest = {
          paymentToken: paymentData?.t || "",
          paymentData: {
            amount: paymentData?.a || 0,
            paymentPhoneNumber: phoneNumber,
            paymentMethod: currentPaymentMethod!,
          },
        };

        // Initialiser le paiement MTN/Moov
        const response = await paymentService.initializePayment(paymentRequest);
        //console.log("response init: ", response);

        if (response.success || response.status) {
          // Sauvegarder l'URL de retour pour revenir après le paiement
          sessionStorage.setItem("returnPaymentUrl", window.location.href);

          // Préparer les données pour la page d'attente
          const verificationData = {
            ref: response?.paymentRef,
            t: paymentData?.t,
          };
          const encodedData = encodeData(verificationData);

          // Rediriger vers la page d'attente
          navigate(
            `${APP_ROUTES.PENDING_PAYMENT}?data=${encodedData}&provider=${currentPaymentMethod}`,
            { replace: true }
          );
          return true;
        } else {
          setError(
            response.message || "Erreur lors de l'initialisation du paiement"
          );
          return false;
        }
      }
    } catch (error: any) {
      // Gestion globale des erreurs
      setError(
        error.response?.data?.message ||
          "Une erreur est survenue lors du paiement"
      );
      return false;
    } finally {
      // Fermer le modal seulement si ce n'est pas Orange Money ou si on a soumis le code
      if (
        currentPaymentMethod !== "orange" ||
        (currentPaymentMethod === "orange" && otp)
      ) {
        setLoading(false);
        setIsModalOpen(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handlePaymentClick = (method: "orange" | "mtn" | "moov") => {
    setCurrentPaymentMethod(method);
    setIsModalOpen(true);
  };

  if (!paymentData) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img
          src={APP_ASSETS.nxash.LOGO_REMOVED_BG}
          alt="NEHONIX Logo"
          style={{
            width: "150px",
            marginBottom: "2rem",
            display: "block",
            margin: "0 auto",
          }}
        />
        <h2>Paiement de la Formation</h2>

        <div className="payment-summary">
          <h3>Récapitulatif</h3>
          <div className="summary-item">
            <span>Nom:</span>
            <span>{paymentData.u}</span>
          </div>
          <div className="summary-item">
            <span>Email:</span>
            <span>{paymentData.e}</span>
          </div>
          <div className="summary-item">
            <span>Matricule:</span>
            <span>{paymentData.m}</span>
          </div>
          <div className="summary-item">
            <span>Formation:</span>
            <span>{paymentData.s}</span>
          </div>
          <div className="summary-item total">
            <span>Montant à payer:</span>
            <span>{paymentData.a.toLocaleString()} FCFA</span>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Choisissez votre méthode de paiement</h3>

          <button
            onClick={() => handlePaymentClick("moov")}
            className="btn btn-payment moov"
            disabled={loading}
          >
            <img src={APP_ASSETS.payment.MOOV_MONEY} alt="Moov" />
            Payer avec Moov Money
          </button>

          <button
            onClick={() => handlePaymentClick("orange")}
            className="btn btn-payment orange"
            disabled={loading}
          >
            <img src={APP_ASSETS.payment.ORANGE_MONEY} alt="Orange Money" />
            Payer avec Orange Money
          </button>

          <button
            onClick={() => handlePaymentClick("mtn")}
            className="btn btn-payment mtn"
            disabled={loading}
          >
            <img src={APP_ASSETS.payment.MTN_MONEY} alt="MTN Money" />
            Payer avec MTN Money
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <p className="payment-note">
          Une fois le paiement effectué, vous recevrez un email de confirmation
          avec vos identifiants de connexion.
        </p>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentPaymentMethod(null);
        }}
        onSubmit={handlePaymentSubmit}
        paymentMethod={currentPaymentMethod}
        loading={loading}
      />
    </div>
  );
};

export default Payment;
