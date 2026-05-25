import "./dashboard.css";
import { useEffect, useState } from "react";
import { getDashboardData } from "./dashboard.service";

export default function Dashboard() {
  const [data, setData] = useState({
    vendors: 0,
    doctors: 0,
    users: 0,
    sales: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <div className="cards">

        <div className="card">
          <p>Vendors</p>
          <h2>{data.vendors}</h2>
        </div>

        <div className="card">
          <p>Doctors</p>
          <h2>{data.doctors}</h2>
        </div>

        <div className="card">
          <p>Users</p>
          <h2>{data.users}</h2>
        </div>

        <div className="card">
          <p>Sales</p>
          <h2>₹{data.sales}</h2>
        </div>

      </div>
    </div>
  );
}