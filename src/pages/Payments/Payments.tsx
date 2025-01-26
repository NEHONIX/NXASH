import React, { useEffect, useState } from "react";
import { IPaymentSession, PaymentStatus } from "../../types/payment";
import api from "../../services/api";
import "./Payments.scss";
import RejectReasonModal from "../../components/RejectReasonModal/RejectReasonModal";

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<IPaymentSession[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    todayAmount: 0,
  });
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );

  const fetchPayments = async () => {
    try {
      const response = await api.get("/payments");
      //console.log("payments response: ", response.data);
      setPayments(response.data.data);
    } catch (error) {
      //console.error("Erreur lors de la récupération des paiements:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/payments/stats");
      setStats(response.data.data);
    } catch (error) {
      //console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  const updatePaymentStatus = async (
    paymentRef: string,
    status: PaymentStatus,
    adminNote?: string
  ) => {
    try {
      //console.log({ status, adminNote });

      await api.put(`/payments/${paymentRef}/status`, { status, adminNote });
      fetchPayments();
      fetchStats();
    } catch (error) {
      //console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  useEffect(() => {
    // Appel initial
    fetchPayments();
    fetchStats();

    // Configuration de l'intervalle
    const interval = setInterval(() => {
      fetchPayments();
      fetchStats();
    }, 4000);

    // Nettoyage lors du démontage du composant
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="payments-container">
      <div className="stats-cards">
        <div className="stat-card total">
          <h3>Total des paiements</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card pending">
          <h3>En attente</h3>
          <p>{stats.pending}</p>
        </div>
        <div className="stat-card approved">
          <h3>Approuvés</h3>
          <p>{stats.approved}</p>
        </div>
        <div className="stat-card rejected">
          <h3>Rejetés</h3>
          <p>{stats.rejected}</p>
        </div>
        <div className="stat-card amount">
          <h3>Montant total (FCFA)</h3>
          <p>{stats.totalAmount.toLocaleString()}</p>
        </div>
        <div className="stat-card today">
          <h3>Montant aujourd'hui (FCFA)</h3>
          <p>{stats.todayAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Numéro de paiement</th>
              <th>Montant (FCFA)</th>
              <th>Méthode</th>
              <th>Statut</th>
              <th>Code Orange</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments
              .filter((payment) => payment.status !== "rejected")
              .map((payment) => (
                <tr key={payment.id} className={`status-${payment.status}`}>
                  <td>{payment.id}</td>
                  <td>{payment.paymentPhoneNumber}</td>
                  <td>{payment.amount.toLocaleString()}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{payment.status}</td>
                  <td style={{ color: "var(--primary-color)" }}>
                    {payment.orangeCode || "Autre réseau"}
                  </td>
                  <td className="actions">
                    {(payment.status === "pending" ||
                      payment.status === "processing") && (
                      <>
                        <button
                          className="approve"
                          onClick={() =>
                            updatePaymentStatus(
                              payment.id,
                              "approved",
                              "Paiement vérifié et validé avec succès"
                            )
                          }
                        >
                          Approuver
                        </button>
                        <button
                          className="reject"
                          onClick={() => {
                            setSelectedPaymentId(payment.id);
                            setIsRejectModalOpen(true);
                          }}
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <RejectReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedPaymentId(null);
        }}
        onSelect={(reason) => {
          if (selectedPaymentId) {
            updatePaymentStatus(selectedPaymentId, "rejected", reason);
          }
          setIsRejectModalOpen(false);
          setSelectedPaymentId(null);
        }}
      />
    </div>
  );
};

export default Payments;

// const text = "Paiement approuvé!";
