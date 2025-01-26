function PlanDisponible({ plans, selectedPlan, handleSubscribe }: Plan) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="dashboard-card"
          style={{
            border:
              selectedPlan === plan.id
                ? "2px solid #000080"
                : "1px solid #e2e8f0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {selectedPlan === plan.id && (
            <div
              style={{
                position: "absolute",
                top: "1rem",
                right: "-2rem",
                transform: "rotate(45deg)",
                backgroundColor: "#000080",
                color: "white",
                padding: "0.25rem 3rem",
                fontSize: "0.875rem",
              }}
            >
              Actuel
            </div>
          )}
          <h2 style={{ color: "#000080", marginBottom: "0.5rem" }}>
            {plan.name}
          </h2>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#000080",
              marginBottom: "1rem",
            }}
          >
            {plan.price.toLocaleString()} FCFA
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: "normal",
                color: "#666",
              }}
            >
              {" "}
              / {plan.duration}
            </span>
          </div>
          <ul style={{ marginBottom: "2rem" }}>
            {plan.features.map((feature, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ color: "#22c55e" }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <button
            className={`btn ${
              selectedPlan === plan.id ? "btn-secondary" : "btn-primary"
            }`}
            style={{ width: "100%" }}
            onClick={() => handleSubscribe(plan.id)}
            disabled={selectedPlan === plan.id}
          >
            {selectedPlan === plan.id ? "Plan actuel" : "Choisir ce plan"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default PlanDisponible;

interface Plan {
  plans: {
    id: string;
    name: string;
    price: number;
    duration: string;
    features: string[];
  }[];
  selectedPlan: string;
  handleSubscribe: (planId: string) => void;
}
