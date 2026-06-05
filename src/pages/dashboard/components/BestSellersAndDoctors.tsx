import { FaStar, FaExclamationCircle } from "react-icons/fa";

interface Doctor {
  id: number;
  doctor_id: string;
  full_name: string;
  mobile: string;
  status: string;
}

interface BestSellersAndDoctorsProps {
  doctors: Doctor[];
}

export default function BestSellersAndDoctors({ doctors }: BestSellersAndDoctorsProps) {
  const topMedicines = [
    { name: "VitMithra Milk Booster 1L", sales: "840 units", pct: 85, color: "#10b981" },
    { name: "Cattle Dewormer Plus", sales: "620 units", pct: 65, color: "#0284c7" },
    { name: "Cal-Glow Strong Liquid", sales: "490 units", pct: 50, color: "#f59e0b" },
    { name: "Cof-Guard Animal Vet Syrup", sales: "310 units", pct: 35, color: "#8b5cf6" },
  ];

  const systemAlerts = [
    { message: "Active Area Doctors network is growing", level: "low", desc: "Coordinating village maps for onboarding." },
    { message: "Medicine 'Dewormer Plus' Stock < 15%", level: "medium", desc: "Reorder trigger notification sent to Stock Manager." },
    { message: "Pending doctor profiles verification", level: "high", desc: "Please check newly registered doctor profiles." }
  ];

  return (
    <div className="dashboard-bottom-row">
      {/* TOP MEDICINES */}
      <div className="bottom-card-widget glass-panel">
        <div className="widget-header">
          <h2>Best Selling Products</h2>
          <span className="widget-badge">Monthly</span>
        </div>
        <div className="products-list">
          {topMedicines.map((med, idx) => (
            <div className="product-item" key={idx}>
              <div className="product-details">
                <span className="product-name">{med.name}</span>
                <span className="product-sales">{med.sales}</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${med.pct}%`, backgroundColor: med.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP DOCTORS */}
      <div className="bottom-card-widget glass-panel">
        <div className="widget-header">
          <h2>Star Area Veterinarians</h2>
          <span className="widget-badge active">Top Rated</span>
        </div>
        <div className="doctors-list">
          {doctors.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No veterinarians onboarded yet.
            </div>
          ) : (
            doctors.slice(0, 3).map((doc, idx) => (
              <div className="doctor-item-card" key={idx}>
                <div className="avatar-placeholder" style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "16px",
                  marginRight: "14px"
                }}>
                  {doc.full_name.charAt(0)}
                </div>
                <div className="doc-widget-info">
                  <h4>{doc.full_name}</h4>
                  <span className="doc-specialty">ID: {doc.doctor_id} | {doc.mobile}</span>
                  <div className="doc-stats">
                    <span className="rating-span">
                      <FaStar className="star-icon" /> 4.9
                    </span>
                    <span className="dot-divider">•</span>
                    <span className={`status-tag ${(doc.status || "ACTIVE").toLowerCase()}`} style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: (doc.status || "ACTIVE") === "ACTIVE" ? "var(--primary)" : "var(--accent-rose)"
                    }}>{doc.status || "ACTIVE"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ACTIVE ALERTS */}
      <div className="bottom-card-widget glass-panel">
        <div className="widget-header">
          <h2>Critical Operations Alerts</h2>
          <span className="alert-count-badge">3 Active</span>
        </div>
        <div className="alerts-feed">
          {systemAlerts.map((alt, idx) => (
            <div className={`alert-feed-item ${alt.level}`} key={idx}>
              <div className="alert-item-header">
                <FaExclamationCircle />
                <span>{alt.message}</span>
              </div>
              <p className="alert-desc">{alt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
