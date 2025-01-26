import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  fetchReferalStats,
  fetchReferalHistory,
  inviteFriends,
  clearSuccessMessage,
} from "../store/slices/referalSlice";

const Referrals = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [inviteEmail, setInviteEmail] = useState("");
  const { stats, history, loading, error, successMessage } = useSelector(
    (state: RootState) => state.referal
  );

  //console.log("referals: ", { stats, history, loading, error, successMessage });
  useEffect(() => {
    dispatch(fetchReferalStats());
    dispatch(fetchReferalHistory());
  }, [dispatch]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(inviteFriends([inviteEmail]));
    setInviteEmail("");
    setTimeout(() => dispatch(clearSuccessMessage()), 3000);
  };

  if (loading.stats || loading.history) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1 style={{ color: "#000080", marginBottom: "2rem" }}>
        Programme de Parrainage
      </h1>

      {/* Section Statistiques */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="dashboard-card">
          <h3>Total Parrainages</h3>
          <p style={{ fontSize: "2rem", color: "#000080" }}>
            {stats?.totalReferals || 0}
          </p>
        </div>
        <div className="dashboard-card">
          <h3>Invitations Envoyées</h3>
          <p style={{ fontSize: "2rem", color: "#22c55e" }}>
            {stats?.invitedCount || 0}
          </p>
        </div>
        <div className="dashboard-card">
          <h3>Inscriptions Réussies</h3>
          <p style={{ fontSize: "2rem", color: "#00BFFF" }}>
            {stats?.registeredCount || 0}
          </p>
        </div>
      </div>

      {/* Section Invitation */}
      <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Inviter un ami</h2>
        <form onSubmit={handleInvite}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email de votre ami"
              style={{ flex: 1 }}
              required
              disabled={loading.invite}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading.invite}
            >
              {loading.invite ? "Envoi en cours..." : "Envoyer l'invitation"}
            </button>
          </div>
        </form>
        {successMessage && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.5rem",
              backgroundColor: "#dcfce7",
              color: "#22c55e",
              borderRadius: "0.375rem",
            }}
          >
            {successMessage}
          </div>
        )}
        {error.invite && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.5rem",
              backgroundColor: "#fee2e2",
              color: "#ef4444",
              borderRadius: "0.375rem",
            }}
          >
            {error.invite}
          </div>
        )}
      </div>

      {/* Liste des parrainages */}
      <div className="dashboard-card">
        <h2 style={{ marginBottom: "1rem" }}>Mes Parrainages</h2>
        <div style={{ display: "grid", gap: "1rem" }}>
          {history?.registeredReferals.map((referral) => (
            <div
              key={referral.id}
              style={{
                padding: "1rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>{referral.name}</div>
                <div style={{ fontSize: "0.875rem", color: "#666" }}>
                  Parrainé le{" "}
                  {new Date(referral.registeredAt).toLocaleDateString()}
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.875rem",
                    backgroundColor: "#dcfce7",
                    color: "#22c55e",
                  }}
                >
                  Actif
                </span>
                <span style={{ color: "#000080", fontWeight: "bold" }}>
                  +500 points
                </span>
              </div>
            </div>
          ))}
          {history?.registeredReferals.length === 0 && (
            <div
              style={{ textAlign: "center", color: "#666", padding: "2rem" }}
            >
              Aucun parrainage pour le moment
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referrals;
