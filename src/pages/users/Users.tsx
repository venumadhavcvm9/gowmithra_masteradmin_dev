// src/pages/users/Users.tsx

import "./users.css";
import { useEffect, useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import { getUsers } from "./users.service";
import type { User } from "./users.service";

export default function Users() {
  const [farmers, setFarmers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [animalFilter, setAnimalFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = () => {
    setIsLoading(true);
    getUsers()
      .then((res) => {
        setFarmers(res.data);
      })
      .catch((err) => {
        console.error("Users retrieval error:", err);
        toast.error("Failed to load registered farmers directory from database.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // 🔹 Filtering live farmers based on search and parameters
  const filteredFarmers = farmers.filter(f => {
    const status = f.status || "ACTIVE";
    const animalVal = f.animal || "";

    const matchesSearch = f.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          f.id.toString().includes(search) ||
                          (f.mobile || "").includes(search) ||
                          (f.address || "").toLowerCase().includes(search.toLowerCase());
    
    let matchesAnimal = true;
    if (animalFilter !== "All") {
      if (animalFilter === "Unspecified") {
        matchesAnimal = !animalVal;
      } else {
        matchesAnimal = animalVal.toLowerCase() === animalFilter.toLowerCase();
      }
    }
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    
    return matchesSearch && matchesAnimal && matchesStatus;
  });

  return (
    <div className="users-page">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="users-top-bar">
        <div>
          <h1 className="text-gradient">Farmers & Cattle Breeders</h1>
          <p>Manage registered dairy farmers, their livestock herd sizes, and health configurations.</p>
        </div>
        <button className="add-farmer-btn" onClick={loadFarmers}>
          <span>Refresh List</span>
        </button>
      </div>

      {/* QUICK METRICS OVERVIEW */}
      <div className="users-metrics">
        <div className="metric-box glass-panel">
          <span className="metric-title">Registered Farmers</span>
          <h2>{farmers.length} Total</h2>
          <span className="metric-sub text-up">Synced with database</span>
        </div>
        <div className="metric-box glass-panel">
          <span className="metric-title">Verified Contact Numbers</span>
          <h2>{farmers.filter(f => f.is_mobile_verified).length} Verified</h2>
          <span className="metric-sub text-up">Secure verification</span>
        </div>
        <div className="metric-box glass-panel">
          <span className="metric-title">Registered Animals</span>
          <h2>{farmers.filter(f => f.animal).length} Tracked</h2>
          <span className="metric-sub text-up">Livestock profiles</span>
        </div>
        <div className="metric-box glass-panel">
          <span className="metric-title">Active Accounts</span>
          <h2 className="healthy-count">{farmers.filter(f => (f.status || "ACTIVE") === "ACTIVE").length} Active</h2>
          <span className="metric-sub text-duty">Authorized statuses</span>
        </div>
      </div>

      {/* CONTROLS BAR (SEARCH & FILTER) */}
      <div className="users-controls glass-panel">
        <div className="search-group">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by ID, name, mobile or address..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="filter-select">
            <FaFilter className="filter-icon" />
            <select value={animalFilter} onChange={(e) => setAnimalFilter(e.target.value)}>
              <option value="All">All Animals</option>
              <option value="COW">Cows</option>
              <option value="BUFFALO">Buffaloes</option>
              <option value="Unspecified">Not Specified</option>
            </select>
          </div>

          <div className="filter-select">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">On Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* FARMERS DIRECTORY TABLE */}
      {isLoading ? (
        <div style={{ padding: "80px", textAlign: "center", fontWeight: 600, color: "var(--text-muted)" }}>
          Loading farmers register...
        </div>
      ) : (
        <div className="table-row-section glass-panel">
          <div className="table-responsive">
            {filteredFarmers.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontWeight: 500 }}>
                No farmers found matching your search filters.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>System ID</th>
                    <th>Farmer Name</th>
                    <th>Mobile Contact</th>
                    <th>Mobile Verified</th>
                    <th>Animal Type</th>
                    <th>Location Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id}>
                      <td>
                        <span className="order-id-label">FM00{farmer.id}</span>
                      </td>
                      <td>
                        <div className="farmer-profile-cell">
                          <div className="avatar-placeholder" style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "13px"
                          }}>
                            {farmer.full_name.charAt(0)}
                          </div>
                          <strong>{farmer.full_name}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="medicine-tag">{farmer.mobile}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${farmer.is_mobile_verified ? "delivered" : "pending"}`}>
                          <span className="status-dot"></span>
                          {farmer.is_mobile_verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>
                        {farmer.animal ? (
                          <span className="status-pill delivered" style={{
                            background: "rgba(2, 132, 199, 0.1)",
                            color: "var(--accent-blue)"
                          }}>
                            <span className="status-dot" style={{ backgroundColor: "var(--accent-blue)" }}></span>
                            {farmer.animal.toUpperCase()}
                          </span>
                        ) : (
                          <span className="date-label">Not Specified</span>
                        )}
                      </td>
                      <td>
                        <span className="date-label">{farmer.address || "N/A"}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${farmer.status === "ACTIVE" ? "delivered" : "cancelled"}`}>
                          <span className="status-dot"></span>
                          {farmer.status === "ACTIVE" ? "Active" : "On Hold"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
