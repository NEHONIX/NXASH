import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { fetchDashboardStats } from "../store/slices/dashboardSlice";
import { fetchReferalHistory } from "../store/slices/referalSlice";
import LeftSideBar from "./Libs/Profil/LeftSideBar.Profil";
import PersonalProfil from "./Libs/Profil/Personal.profil";
import SubscriptionProfil from "./Libs/Profil/Subscription.profil";
import { AuthUserT } from "../store/slices/authSlice";
import { GET_PATH_TITLE } from "../utils/getTitle";
// import { formatDateToFr, formatFirestoreDate } from "../utils/dateUtils";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data } = useSelector((state: RootState) => state.dashboard);
  const { history } = useSelector((state: RootState) => state.referal);
  const stats = data?.stats;
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'subscription' | 'referrals'

  //console.log("stats profile: ", stats);

  useEffect(() => {
    GET_PATH_TITLE(user?.name + " - Mon Profil | NXASH");
    dispatch(fetchDashboardStats());
    if (activeTab === "referrals") {
      dispatch(fetchReferalHistory());
    }
  }, [dispatch, activeTab]);

  return (
    <div>
      <h1 style={{ color: "#000080", marginBottom: "2rem" }}>Mon Profil</h1>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Left sidebar with tabs */}
        <LeftSideBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main content area */}
        <div style={{ flex: 1 }}>
          {activeTab === "profile" && (
            <PersonalProfil user={user as AuthUserT} />
          )}

          {activeTab === "subscription" && <SubscriptionProfil stats={stats} />}

          {activeTab === "referrals" && (
            <div className="dashboard-card">
              <h2 className="dashboard-card-header">Mes Parrainages</h2>
              <div style={{ marginBottom: "2rem" }}>
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
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
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
                {(!history?.registeredReferals ||
                  history.registeredReferals.length === 0) && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#666",
                      padding: "2rem",
                    }}
                  >
                    Aucun parrainage pour le moment
                  </div>
                )}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => navigate("/referrals")}
              >
                Gérer mes parrainages
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
