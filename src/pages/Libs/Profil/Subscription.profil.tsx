import { useState } from "react";
import { dashboardService } from "../../../services/api";
import { DashboardStats } from "../../../types/dashboard";

function SubscriptionProfil({ stats }: { stats: DashboardStats | undefined }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleSubscription() {
    setLoading(true);
    try {
      await dashboardService.renewSubscription();
    } catch (error: any) {
      //console.log(error);
      setErrorMsg(
        error?.response?.data?.error ||
          error.message ||
          "Une erreur est survenue lors de la renouvellement de l'abonnement"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card-header">Détails de l'Abonnement</h2>
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span>Statut</span>
          <span
            style={{
              color:
                stats?.subscriptionStatus === "actif" ? "#22c55e" : "#ef4444",
              fontWeight: "bold",
            }}
          >
            {stats?.subscriptionStatus === "actif" ? "Actif" : "Inactif"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          {/* <span>Plan</span>
                  <span>{mockUser.subscription.plan}</span> */}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <span>Prochain paiement</span>
          <span>
            {/* {formatDateToFr(
                      formatFirestoreDate(
                        stats?.subscription?.prochainPaiement!
                      )
                    ) || "Inconnu"} */}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <span>Montant</span>
          <span>{stats?.subscription?.montantMensuel} FCFA</span>
        </div>
      </div>
      <button
        disabled={loading}
        onClick={() => handleSubscription()}
        className="btn btn-primary"
        style={{ width: "100%" }}
      >
        {loading ? "En cours..." : "Renouveler l'abonnement"}
      </button>

      {errorMsg && (
        <div
          style={{
            color: "red",
            marginTop: "1rem",
          }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}

export default SubscriptionProfil;
