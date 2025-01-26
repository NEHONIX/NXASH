import { DashboardSubscriptionInfo } from "../../types/dashboard";
import { formatFirestoreDate, formatDateToFr, formatCurrency } from "../../utils/dateUtils";

interface SubscriptionInfoProps {
  subscription: DashboardSubscriptionInfo;
  loading?: boolean;
}

export const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({
  subscription,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="info-card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'actif':
        return 'active';
      case 'inactif':
        return 'inactive';
      default:
        return 'pending';
    }
  };

  return (
    <div className="info-card animate-fade-in">
      <h2>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
          <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
        </svg>
        Informations d'abonnement
      </h2>

      <div className="info-list">
        <div className="info-item">
          <span className="label">Statut</span>
          <span className={`status-badge ${getStatusClass(subscription.status)}`}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>
        </div>

        <div className="info-item">
          <span className="label">Montant mensuel</span>
          <span className="value">{formatCurrency(subscription.montantMensuel)}</span>
        </div>

        <div className="info-item">
          <span className="label">Spécialité</span>
          <span className="value">{subscription.specialty}</span>
        </div>

        <div className="info-item">
          <span className="label">Date de début</span>
          <span className="value">
            {formatDateToFr(formatFirestoreDate(subscription.dateDebut))}
          </span>
        </div>

        <div className="info-item">
          <span className="label">Prochain paiement</span>
          <span className="value">
            {formatDateToFr(formatFirestoreDate(subscription.prochainPaiement))}
          </span>
        </div>

        {subscription.dernierPaiement && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Dernier paiement</h3>
            <div className="bg-blue-50 p-4 rounded-xl space-y-2">
              <div className="info-item bg-white/80">
                <span className="label">Référence</span>
                <span className="value">{subscription.dernierPaiement.paymentRef}</span>
              </div>
              <div className="info-item bg-white/80">
                <span className="label">Montant</span>
                <span className="value">{formatCurrency(subscription.dernierPaiement.montant)}</span>
              </div>
              <div className="info-item bg-white/80">
                <span className="label">Date</span>
                <span className="value">
                  {formatDateToFr(formatFirestoreDate(subscription.dernierPaiement.datePaiement))}
                </span>
              </div>
              <div className="info-item bg-white/80">
                <span className="label">Méthode</span>
                <span className="value capitalize">{subscription.dernierPaiement.methode}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
