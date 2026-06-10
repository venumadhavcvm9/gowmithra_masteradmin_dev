import { FaUsers, FaUserMd, FaClinicMedical } from "react-icons/fa";

interface DashboardStatsProps {
  farmersCount: number;
  doctorsCount: number;
  vendorsCount: number;
}

export default function DashboardStats({
  farmersCount,
  doctorsCount,
  vendorsCount,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Registered Farmers",
      value: farmersCount.toLocaleString(),
      icon: <FaUsers />,
      isPositive: true,
      glowColor: "rgba(16, 185, 129, 0.15)",
      accentColor: "#10b981"
    },
    {
      title: "Active Area Doctors",
      value: doctorsCount.toLocaleString(),
      icon: <FaUserMd />,
      isPositive: true,
      glowColor: "rgba(2, 132, 199, 0.15)",
      accentColor: "#0284c7"
    },
    {
      title: "Vendors",
      value: vendorsCount.toLocaleString(),
      icon: <FaClinicMedical />,
      isPositive: false,
      glowColor: "rgba(245, 158, 11, 0.15)",
      accentColor: "#f59e0b"
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((item, index) => (
        <div
          className="stat-card"
          key={index}
          style={{
            boxShadow: `0 10px 30px -10px ${item.glowColor}`,
            border: `1px solid rgba(226, 232, 240, 0.7)`
          }}
        >
          <div className="stat-card-left">
            <div
              className="stat-icon-wrapper"
              style={{
                background: `${item.glowColor}`,
                color: item.accentColor
              }}
            >
              {item.icon}
            </div>

          </div>

          <div className="stat-card-right">
            <h3>{item.title}</h3>
            <h2>{item.value}</h2>
            <p className="since-text">Compared to last month</p>
          </div>
        </div>
      ))}
    </div>
  );
}
