import { AuthUserT } from "../../../store/slices/authSlice";
import { formatDateToFr, formatFirestoreDate } from "../../../utils/dateUtils";

function PersonalProfil({ user }: { user: AuthUserT }) {
  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card-header">Informations Personnelles</h2>
      <div style={{ display: "grid", gap: "1rem" }}>
        <div className="form-group">
          <label>Nom complet</label>
          <input type="text" value={user?.name || "Inconnu"} disabled />
        </div>
        <div className="form-group">
          <label>Matricule</label>
          <input type="text" value={user?.matricule || "Inconnu"} disabled />
        </div>
        <div className="form-group">
          <label>Téléphone</label>
          <input type="tel" value={user?.phone || "Inconnu"} disabled />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user?.email || "Inconnu"} disabled />
        </div>
        <div className="form-group">
          <label>Date d'inscription</label>
          <input
            type="text"
            value={
              formatDateToFr(formatFirestoreDate(user?.createdAt!)) || "Inconnu"
            }
            disabled
          />
        </div>
      </div>
    </div>
  );
}

export default PersonalProfil;
