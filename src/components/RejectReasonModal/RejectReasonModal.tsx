import React, { useState } from 'react';
import './RejectReasonModal.scss';

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (reason: string) => void;
}

const commonReasons = [
  "Paiement non reçu dans notre système",
  "Montant incorrect",
  "Numéro de téléphone invalide",
  "Code de transaction invalide",
  "Doublon de paiement",
  "Information de paiement incomplète"
];

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleCustomReasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customReason.trim()) {
      onSelect(customReason.trim());
      setCustomReason('');
    }
  };

  return (
    <div className="reject-reason-modal-overlay">
      <div className="reject-reason-modal">
        <h3>Sélectionnez la raison du rejet</h3>
        <div className="reasons-list">
          {commonReasons.map((reason, index) => (
            <button
              key={index}
              className="reason-button"
              onClick={() => {
                onSelect(reason);
                onClose();
              }}
            >
              {reason}
            </button>
          ))}
        </div>
        <div className="custom-reason">
          <form onSubmit={handleCustomReasonSubmit}>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Ou saisissez une autre raison..."
              className="custom-reason-input"
            />
            <button 
              type="submit" 
              className="custom-reason-submit"
              disabled={!customReason.trim()}
            >
              Valider
            </button>
          </form>
        </div>
        <button className="close-button" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
};

export default RejectReasonModal;
