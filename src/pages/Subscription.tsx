import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import PlanDisponible from "./PlanDisponible";
import { formatFirestoreDate, formatDateToFr } from "../utils/dateUtils";
import "./Subscription.scss";


const Subscription = () => {
  const { data, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );

  const subscription = data?.stats?.subscription;
  const subscriptionStatus = data?.stats?.subscriptionStatus;

  const handleSubscribe = (planId: string) => {
    // TODO: Implémenter la logique de paiement réelle
    alert("Redirection vers la page de paiement...");
  };

  if (!data?.stats) {
    return (
      <div className="subscription-error">
        <p>Veuillez vous connecter pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="subscription-container">
      <h1>Mon Abonnement</h1>

      <div className="current-status">
        <h2>Statut Actuel</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">Spécialité</span>
            <span className="value plan">
              {subscription?.specialty || "Aucune"}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Statut</span>
            <span className={`value status ${subscriptionStatus || "inactif"}`}>
              {subscriptionStatus === "actif"
                ? "Actif"
                : subscriptionStatus === "en_attente"
                ? "En attente"
                : "Inactif"}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Montant mensuel</span>
            <span className="value">
              {subscription?.montantMensuel
                ? `${subscription.montantMensuel} FCFA`
                : "N/A"}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Date de début</span>
            <span className="value">
              {subscription?.dateDebut
                ? formatDateToFr(
                    formatFirestoreDate({
                      _seconds: subscription.dateDebut._seconds,
                      _nanoseconds: subscription.dateDebut._nanoseconds,
                    })
                  )
                : "N/A"}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Prochain paiement</span>
            <span className="value">
              {subscription?.prochainPaiement
                ? formatDateToFr(
                    formatFirestoreDate({
                      _seconds: subscription.prochainPaiement._seconds,
                      _nanoseconds: subscription.prochainPaiement._nanoseconds,
                    })
                  )
                : "N/A"}
            </span>
          </div>
          {subscription?.dernierPaiement && (
            <>
              <div className="status-item">
                <span className="label">Dernier paiement</span>
                <span className="value">
                  {formatDateToFr(
                    formatFirestoreDate({
                      _seconds:
                        subscription.dernierPaiement.datePaiement._seconds,
                      _nanoseconds:
                        subscription.dernierPaiement.datePaiement._nanoseconds,
                    })
                  )}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Montant dernier paiement</span>
                <span className="value">
                  {`${subscription.dernierPaiement.montant} FCFA`}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Méthode de paiement</span>
                <span className="value">
                  {subscription.dernierPaiement.methode}
                </span>
              </div>
            </>
          )}
          <div className="status-item">
            <span className="label">Paiements réussis</span>
            <span className="value">
              {`${subscription?.paiementsReussis || 0}/${
                subscription?.totalPaiements || 0
              }`}
            </span>
          </div>
        </div>
      </div>

      {/* <PlanDisponible
        handleSubscribe={handleSubscribe}
        plans={plans}
        selectedPlan={subscription?.specialty || ""}
      /> */}
    </div>
  );
};

export default Subscription;
