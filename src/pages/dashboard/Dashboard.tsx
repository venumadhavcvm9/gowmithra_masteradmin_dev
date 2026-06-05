// src/pages/dashboard/Dashboard.tsx

import "./dashboard.css";
import { useEffect, useState } from "react";
import { FaFileExport } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import {
  getAdminDashboardStats,
  getPublicDashboardStats,
  getDashboardDoctors,
  getDashboardUsers
} from "./dashboard.service";
import DashboardStats from "./components/DashboardStats";
import DashboardCharts from "./components/DashboardCharts";
import RecentFarmersTable from "./components/RecentFarmersTable";
import BestSellersAndDoctors from "./components/BestSellersAndDoctors";

export default function Dashboard() {
  const [farmersCount, setFarmersCount] = useState(0);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [vendorsCount, setVendorsCount] = useState(0);
  const catalogCount = 120; // standard medicine category size placeholder

  const [doctors, setDoctors] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch main admin metrics counts
      const adminStatsRes = await getAdminDashboardStats();
      if (adminStatsRes && adminStatsRes.data) {
        setFarmersCount(adminStatsRes.data.usersCount || 0);
        setDoctorsCount(adminStatsRes.data.doctorsCount || 0);
      }

      // 2. Fetch public counts to get vendors count
      try {
        const publicStats = await getPublicDashboardStats();
        if (publicStats) {
          setVendorsCount(publicStats.vendors || 0);
          if (publicStats.users) setFarmersCount(publicStats.users);
          if (publicStats.doctors) setDoctorsCount(publicStats.doctors);
        }
      } catch (err) {
        console.warn("Public dashboard statistics service offline.", err);
      }

      // 3. Fetch star doctors list
      const doctorsListRes = await getDashboardDoctors();
      if (doctorsListRes && doctorsListRes.data) {
        setDoctors(doctorsListRes.data);
      }

      // 4. Fetch registered farmers
      const farmersListRes = await getDashboardUsers();
      if (farmersListRes && farmersListRes.data) {
        setFarmers(farmersListRes.data);
      }
    } catch (error: any) {
      console.error("Dashboard backend loader failure:", error);
      toast.error("Failed to retrieve live operations statistics from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="dashboard-top">
        <div>
          <h1 className="text-gradient">Veterinary Operations Hub</h1>
          <p>Real-time analytics and livestock healthcare distribution controls.</p>
        </div>

        <div className="top-action-group">
          <button className="new-btn" aria-label="Add New Asset" onClick={loadDashboardData}>
            <span>Refresh Stats</span>
          </button>
          <button className="export-btn" aria-label="Export Reports">
            <FaFileExport />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: "80px", textAlign: "center", fontWeight: 600, color: "var(--text-muted)" }}>
          Synchronizing with Admin database services...
        </div>
      ) : (
        <>
          {/* STATS GRID */}
          <DashboardStats
            farmersCount={farmersCount}
            doctorsCount={doctorsCount}
            vendorsCount={vendorsCount}
            catalogCount={catalogCount}
          />

          {/* CHARTS CONTAINER SECTION */}
          <DashboardCharts />

          {/* RECENT FARMERS TABLE ROW */}
          <RecentFarmersTable farmers={farmers} />

          {/* BOTTOM ANALYSIS SECTION */}
          <BestSellersAndDoctors doctors={doctors} />
        </>
      )}
    </div>
  );
}