// src/pages/users/Users.tsx

import "./users.css";
import { useEffect, useState } from "react";
import { 
  FaSearch, 
  FaFilter, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import { getUsers } from "./users.service";
import type { User } from "./users.service";

export default function Users() {
  const [farmers, setFarmers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [breedFilter, setBreedFilter] = useState("All");
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
    const mainBreed = f.id % 2 === 0 ? "Gir" : "Holstein Friesian";
    const status = f.status || "ACTIVE";

    const matchesSearch = f.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          f.id.toString().includes(search) ||
                          (f.address || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesBreed = breedFilter === "All" || mainBreed === breedFilter;
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    
    return matchesSearch && matchesBreed && matchesStatus;
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
          <span className="metric-title">Tracked Cattle Headcount</span>
          <h2>{farmers.length * 15} <span className="inline-cow-icon">🐄</span></h2>
          <span className="metric-sub text-up">88% Cows | 12% Buffaloes</span>
        </div>
        <div className="metric-box glass-panel">
          <span className="metric-title">Avg Daily Milk Yield</span>
          <h2>{(farmers.length * 280).toLocaleString()} Liters</h2>
          <span className="metric-sub text-up">Dynamic estimation</span>
        </div>
        <div className="metric-box glass-panel">
          <span className="metric-title">Active Health Feeds</span>
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
            placeholder="Search by ID, name, or location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="filter-select">
            <FaFilter className="filter-icon" />
            <select value={breedFilter} onChange={(e) => setBreedFilter(e.target.value)}>
              <option value="All">All Breeds</option>
              <option value="Holstein Friesian">Holstein Friesian</option>
              <option value="Jersey">Jersey</option>
              <option value="Gir">Gir</option>
              <option value="Sahiwal">Sahiwal</option>
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

      {/* FARMERS DIRECTORY GRID */}
      {isLoading ? (
        <div style={{ padding: "80px", textAlign: "center", fontWeight: 600, color: "var(--text-muted)" }}>
          Loading farmers register...
        </div>
      ) : (
        <div className="farmers-grid">
          {filteredFarmers.map((farmer) => {
            const cows = (farmer.id * 3) % 15 + 4;
            const buffaloes = (farmer.id * 2) % 8 + 1;
            const yieldVal = cows * 14 + buffaloes * 10;
            const mainBreed = farmer.id % 2 === 0 ? "Gir" : "Holstein Friesian";
            const status = farmer.status || "ACTIVE";

            return (
              <div className={`farmer-card glass-panel card-hover-effect ${status === "INACTIVE" ? "row-muted" : ""}`} key={farmer.id}>
                {/* Header info */}
                <div className="farmer-card-header">
                  <div className="farmer-brief">
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
                      fontSize: "16px"
                    }}>
                      {farmer.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3>{farmer.full_name}</h3>
                      <span className="farmer-id">FM00{farmer.id}</span>
                    </div>
                  </div>
                  <span className={`status-pill ${status.toLowerCase()}`}>
                    <span className="status-dot"></span>
                    {status === "ACTIVE" ? "Active" : "On Hold"}
                  </span>
                </div>

                {/* Content stats */}
                <div className="farmer-stats">
                  <div className="stat-row">
                    <span className="stat-label">Cattle Owned:</span>
                    <span className="stat-value">{cows} Cows, {buffaloes} Buffaloes</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Daily Production:</span>
                    <span className="stat-value highlight">{yieldVal}L</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Primary Cattle Breed:</span>
                    <span className="stat-value">{mainBreed}</span>
                  </div>
                </div>

                {/* Mini Progress bar */}
                <div className="production-bar-section">
                  <div className="production-bar-meta">
                    <span>Milk Yield Efficiency</span>
                    <strong>{yieldVal > 150 ? "Excellent" : "Standard"}</strong>
                  </div>
                  <div className="prod-progress-bg">
                    <div 
                      className="prod-progress-fill" 
                      style={{ 
                        width: `${Math.min(100, (yieldVal / 300) * 100)}%`,
                        backgroundColor: status === "ACTIVE" ? "var(--primary)" : "var(--accent-amber)"
                      }}
                    ></div>
                  </div>
                </div>

                {/* Direct Contacts */}
                <div className="farmer-contacts">
                  <div className="contact-item">
                    <FaPhoneAlt /> <span>{farmer.mobile}</span>
                  </div>
                  <div className="contact-item">
                    <FaEnvelope /> <span>{farmer.full_name.toLowerCase().replace(/\s+/g, "")}@farm.com</span>
                  </div>
                  <div className="contact-item">
                    <FaMapMarkerAlt /> <span>{farmer.address || "N/A"}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="farmer-card-actions">
                  <button className="primary-action-btn">Schedule Vet Visit</button>
                  <button className="secondary-action-btn">View Analytics</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
