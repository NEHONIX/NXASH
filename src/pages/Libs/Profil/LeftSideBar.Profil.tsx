import React from "react";

function LeftSideBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div style={{ width: "200px" }}>
      <div
        className={`sidebar-link ${activeTab === "profile" ? "active" : ""}`}
        onClick={() => setActiveTab("profile")}
        style={{ cursor: "pointer" }}
      >
        👤 Informations
      </div>
      <div
        className={`sidebar-link ${
          activeTab === "subscription" ? "active" : ""
        }`}
        onClick={() => setActiveTab("subscription")}
        style={{ cursor: "pointer" }}
      >
        💳 Abonnement
      </div>
      <div
        className={`sidebar-link ${activeTab === "referrals" ? "active" : ""}`}
        onClick={() => setActiveTab("referrals")}
        style={{ cursor: "pointer" }}
      >
        🤝 Parrainages
      </div>
    </div>
  );
}

export default LeftSideBar;
