import React, { useState } from "react";
import "../styles/modal.css";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phoneNumber: string, otp?: string) => Promise<boolean>;
  paymentMethod: "orange" | "mtn" | "moov" | null;
  loading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  paymentMethod,
  loading,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (paymentMethod === "orange") {
      if (step === "phone") {
        try {
          // Attendre la réponse du serveur avant de passer à l'étape suivante
          const success = await onSubmit(phoneNumber);
          if (success) {
            setStep("otp");
          }
        } catch (err: any) {
          setError(err.message || "Une erreur est survenue");
        }
      } else {
        // Envoyer le code de confirmation
        onSubmit(phoneNumber, otp);
      }
    } else {
      // Pour MTN et Moov, envoyer directement le numéro
      onSubmit(phoneNumber);
    }
  };

  const getTitle = () => {
    switch (paymentMethod) {
      case "orange":
        return "Paiement Orange Money";
      case "mtn":
        return "Paiement MTN Money";
      case "moov":
        return "Paiement Moov Money";
      default:
        return "Paiement";
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{getTitle()}</h3>
        <form onSubmit={handleSubmit}>
          {step === "phone" && (
            <div className="form-group">
              <label>Numéro de téléphone</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+225 0XXXXXXXXX"
                required
                pattern="^\+225 0\d{9}$"
                disabled={loading}
              />
              <small className="help-text">Format: +225 0XXXXXXXXX</small>
            </div>
          )}

          {step === "otp" && paymentMethod === "orange" && (
            <>
              <p className="instructions">
                Nous avons initié une demande de paiement pour votre numéro{" "}
                {phoneNumber}
                <br />
                <br />
                1. Vous allez recevoir une notification par email
                <br />
                2. Validez la transaction sur votre téléphone en composant le
                #144 * 82#
                <br />
                3. Entrez le code généré par orange ci-dessous <br /> <br />
                <span style={{ color: "red" }}>
                  Cela peut prendre quelques minutes avant la validation
                </span>
              </p>
              <div className="form-group">
                <label>Code de confirmation</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Entrez le code"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => {
                setPhoneNumber("");
                setOtp("");
                setStep("phone");
                setError("");
                onClose();
              }}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Traitement..."
                : step === "otp"
                ? "Confirmer"
                : "Continuer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
