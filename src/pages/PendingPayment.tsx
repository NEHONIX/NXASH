import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { APP_ASSETS } from "../nehonix/assets/APP_ASSETS";
import { APP_ROUTES } from "./nehonix/app.endpoints";
import { paymentService } from "../api/payment.api";
import { decodeData } from "../utils/encryption";
import "../styles/pending-payment.scss";
import { ApprovalStatus } from "../store/slices/authSlice";

interface PaymentStatus {
  status: "pending" | "success" | "failed";
  message: string;
}

const PendingPayment = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(900); // 15 minutes

  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>({
    status: "pending",
    message: "Vérification du paiement en cours...",
  });

  useEffect(() => {
    const encodedData = searchParams.get("data");
    const provider = searchParams.get("provider");

    if (!encodedData || !provider) {
      navigate(APP_ROUTES.REGISTER, { replace: true });
      return;
    }

    const decodedData = decodeData(encodedData);
    //console.log("decodedData: ", decodedData);

    if (!decodedData?.t) {
      setStatus({
        status: "failed",
        message: "Données de paiement invalides",
      });
      return;
    }

    // Vérification du paiement toutes les 4 secondes
    const checkPayment = async () => {
      // //console.log("decodedData: ", decodedData);

      try {
        const response = (await paymentService.verifyPayment(
          decodedData.ref
        )) as checkPaymentRes;
        //console.log("response: ", response);
        if (response.status === "approved") {
          setStatus({
            status: "success",
            message: successMessage,
          });
          setTimeout(() => {
            navigate(APP_ROUTES.LOGIN, { replace: true });
          }, 7000);
          return true;
        } else if (response.status === "rejected") {
          //console.log("response: ", response);
          setStatus({
            status: "failed",
            message:
              response.message || "Le paiement a échoué. Veuillez réessayer.",
          });
          return true;
        }
        return false;
      } catch (error) {
        //console.error("Erreur lors de la vérification:", error);
        return false;
      }
    };

    const intervalId = setInterval(async () => {
      const isCompleted = await checkPayment();
      if (isCompleted) {
        clearInterval(intervalId);
      }
    }, 4000);

    // Compte à rebours
    const countdownId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownId);
          clearInterval(intervalId);
          setStatus({
            status: "failed",
            message: "Le délai de paiement a expiré. Veuillez réessayer.",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, [navigate, searchParams]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleRetry = () => {
    // navigate(APP_ROUTES.PAYMENT, { replace: true });
    const getReturnUrI = sessionStorage.getItem("returnPaymentUrl");
    if (getReturnUrI) {
      window.location.replace(getReturnUrI);
    } else {
      navigate(APP_ROUTES.PAYMENT, { replace: true });
    }
  };

  return (
    <div className="pending-payment-container">
      <div className="pending-payment-card">
        <img
          src={APP_ASSETS.nxash.LOGO_REMOVED_BG}
          alt="NEHONIX Logo"
          className="logo"
        />

        <div className={`status-container ${status.status}`}>
          {status.status === "pending" && (
            <div className="loading-spinner"></div>
          )}

          {status.status === "success" && <div className="success-icon">✓</div>}

          {status.status === "failed" && <div className="failed-icon">×</div>}

          <h2>{status.message}</h2>

          {status.status === "pending" && (
            <div className="countdown">
              <p>Temps restant : {formatTime(countdown)}</p>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${(countdown / 180) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {status.status === "failed" && (
            <button onClick={handleRetry} className="retry-button">
              Réessayer le paiement
            </button>
          )}
        </div>

        <p className="help-text">
          En cas de problème, contactez le support au{" "}
          <a href="tel:+2250700000000"> +225 0712137266</a>
        </p>
      </div>
    </div>
  );
};

export default PendingPayment;

interface checkPaymentRes {
  status: ApprovalStatus;
  message: string;
  paymentRef: string;
  processedBy: string;
  userId: string;
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

const successMessage = `Paiement confirmé !
Votre paiement a été validé avec succès. 
Veuillez vous reconnecter pour activer votre compte.
Redirection vers la page de connexion en cours...`;
