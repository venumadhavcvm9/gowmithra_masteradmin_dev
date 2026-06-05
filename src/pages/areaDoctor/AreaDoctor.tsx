// src/pages/areaDoctor/AreaDoctor.tsx

import "./areaDoctor.css";
import { useEffect, useState } from "react";
import { 
  getDoctors, 
  updateDoctorStatus, 
  updateDoctorDetails
} from "./areaDoctor.service";
import type { Doctor } from "./areaDoctor.service";
import { 
  FaSearch, 
  FaStar, 
  FaStethoscope, 
  FaPlus, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaClipboardCheck, 
  FaClock,
  FaEdit,
  FaTimes,
  FaCheck,
  FaIdCard,
  FaLock
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

export default function AreaDoctor() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Editing Modal States
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDegree, setEditDegree] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editCommissionRate, setEditCommissionRate] = useState("");
  const [editAadhaar, setEditAadhaar] = useState("");
  const [editPan, setEditPan] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = () => {
    setIsLoading(true);
    getDoctors()
      .then((res) => {
        setDoctors(res.data);
      })
      .catch(() => {
        toast.error("Failed to load doctor listings.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Toggle Doctor Active / Hide (Hold) Status
  const handleStatusToggle = (doc: Doctor) => {
    const nextStatus = doc.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const statusLabel = nextStatus === "ACTIVE" ? "Activated" : "Hidden (Inactive)";

    const loadToast = toast.loading(`Updating doctor status...`);
    updateDoctorStatus(doc.id, nextStatus)
      .then(() => {
        toast.success(`Doctor successfully ${statusLabel}!`, { id: loadToast });
        loadDoctors();
      })
      .catch(() => {
        toast.error("Status update failed.", { id: loadToast });
      });
  };

  // Open Edit Modal with exact restricted fields
  const openEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setEditFullName(doc.full_name);
    setEditAddress(doc.address || "");
    setEditDegree(doc.degree || "");
    setEditSpecialty(doc.specialty || "");
    setEditRegion(doc.region || "");
    setEditCommissionRate(doc.commissionRate || "");
    setEditAadhaar(doc.aadhaar || "");
    setEditPan(doc.pan || "");
  };

  // Save Edit Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    // Build update packet. Ignore/Omit doctor_id and phone (mobile) as per security rules!
    const data: Partial<Doctor> = {
      full_name: editFullName,
      address: editAddress,
      degree: editDegree,
      specialty: editSpecialty,
      region: editRegion,
      commissionRate: editCommissionRate,
      aadhaar: editAadhaar,
      pan: editPan
    };

    const loadToast = toast.loading("Saving doctor details...");
    updateDoctorDetails(editingDoctor.id, data)
      .then(() => {
        toast.success("Doctor details updated successfully!", { id: loadToast });
        setEditingDoctor(null);
        loadDoctors();
      })
      .catch(() => {
        toast.error("Doctor update failed.", { id: loadToast });
      });
  };

  // Filtering Logic
  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          d.doctor_id.toLowerCase().includes(search.toLowerCase()) ||
                          (d.region || "").toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialtyFilter === "All" || (d.specialty || "").includes(specialtyFilter);
    const matchesStatus = statusFilter === "All" || (d.status || "ACTIVE") === statusFilter;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  // Department counts
  const totalCount = doctors.length;
  const activeCount = doctors.filter(d => (d.status || "ACTIVE") === "ACTIVE").length;
  const activeCasesCount = doctors.reduce((acc, curr) => acc + (curr.activeCases || 0), 0);

  return (
    <div className="doctors-page">
      <Toaster position="top-right" />
      
      {/* HEADER SECTION */}
      <div className="doctors-top-bar">
        <div>
          <h1 className="text-gradient">Area Veterinarians Network</h1>
          <p>Onboard, coordinate, and review operating commissions for localized field doctors.</p>
        </div>
        <button className="add-doctor-btn" onClick={() => toast("Doctor registration handled via Marketing Sub-Admin forms.")}>
          <FaPlus />
          <span>Onboard Doctor</span>
        </button>
      </div>

      {/* QUICK ANALYTICS METRICS */}
      <div className="doctors-metrics">
        <div className="doc-metric-box glass-panel">
          <span className="doc-metric-title">Onboarded Field Doctors</span>
          <h2>{totalCount} Active</h2>
          <span className="doc-metric-sub text-up">{activeCount} Currently Available</span>
        </div>
        <div className="doc-metric-box glass-panel">
          <span className="doc-metric-title">Live Consultations</span>
          <h2>{activeCasesCount} Active</h2>
          <span className="doc-metric-sub text-duty">Emergency calls on-site</span>
        </div>
        <div className="doc-metric-box glass-panel">
          <span className="doc-metric-title">Emergency Response SLA</span>
          <h2>18.2 Mins <FaClock className="inline-icon" /></h2>
          <span className="doc-metric-sub text-up">98% Cases within SLA limit</span>
        </div>
        <div className="doc-metric-box glass-panel">
          <span className="doc-metric-title">Total Cases Resolved</span>
          <h2>14,820 <FaClipboardCheck className="inline-icon" /></h2>
          <span className="doc-metric-sub text-up">+450 Cases this month</span>
        </div>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="doctors-controls glass-panel">
        <div className="search-group">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or operating region..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="filter-select">
            <FaStethoscope className="filter-icon" />
            <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
              <option value="All">All Specialties</option>
              <option value="Bovine">Bovine Health (Cattle)</option>
              <option value="Avian">Avian & Poultry</option>
              <option value="Nutrition">Livestock Nutrition</option>
              <option value="Equine">Equine & Small Ruminants</option>
            </select>
          </div>

          <div className="filter-select">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active (Visible)</option>
              <option value="INACTIVE">Inactive (Hidden)</option>
            </select>
          </div>
        </div>
      </div>

      {/* DOCTORS GRID */}
      {isLoading ? (
        <div className="table-loading">Querying Veterinarians Register...</div>
      ) : (
        <div className="doctors-grid">
          {filteredDoctors.map((doc, idx) => (
            <div className={`doctor-card glass-panel card-hover-effect ${(doc.status || "ACTIVE") === "INACTIVE" ? "row-muted" : ""}`} key={idx}>
              {/* Top Row: Avatar and Badge */}
              <div className="doctor-card-header">
                <div className="doctor-brief">
                  <div className="avatar-placeholder">
                    {doc.full_name.charAt(0)}
                  </div>
                  <div className="doctor-title-block">
                    <h3>{doc.full_name}</h3>
                    <span className="doc-degree">{doc.degree || "B.V.Sc & A.H"}</span>
                  </div>
                </div>
                <span className={`status-pill ${(doc.status || "ACTIVE").toLowerCase()}`}>
                  <span className="status-dot"></span>
                  {(doc.status || "ACTIVE") === "ACTIVE" ? "Active" : "Hidden"}
                </span>
              </div>

              {/* Middle Row: Star Ratings & Specialty */}
              <div className="doctor-specialty-row">
                <span className="doc-specialty-badge">{doc.specialty || "General Veterinary"}</span>
                <div className="rating-badge">
                  <FaStar className="star-icon" /> <span>{doc.rating || 4.8}</span>
                </div>
              </div>

              {/* Performance metrics grid */}
              <div className="doctor-stats-table">
                <div className="doc-stat-col">
                  <span className="stat-label">Active Cases</span>
                  <strong className="stat-value">{doc.activeCases}</strong>
                </div>
                <div className="doc-stat-col">
                  <span className="stat-label">Resolved Cases</span>
                  <strong className="stat-value">{doc.casesResolved}</strong>
                </div>
                <div className="doc-stat-col">
                  <span className="stat-label">Commission</span>
                  <strong className="stat-value highlight-value">{doc.commissionRate || "5%"}</strong>
                </div>
              </div>

              {/* Operational details */}
              <div className="doctor-details-list">
                <div className="detail-item">
                  <FaMapMarkerAlt /> <span>Operates in: <strong>{doc.region || "N/A"}</strong></span>
                </div>
                <div className="detail-item">
                  <FaPhoneAlt /> <span>Mobile Number: <strong>{doc.mobile}</strong></span>
                </div>
                <div className="detail-item">
                  <FaIdCard /> <span>Pan Card: <strong>{doc.pan || "N/A"}</strong></span>
                </div>
              </div>

              {/* Action triggers */}
              <div className="doctor-actions">
                <button 
                  className={`status-toggle-btn ${(doc.status || "ACTIVE") === "ACTIVE" ? "active" : "inactive"}`}
                  onClick={() => handleStatusToggle(doc)}
                >
                  {(doc.status || "ACTIVE") === "ACTIVE" ? "Hide Doctor" : "Activate Doctor"}
                </button>
                <button className="ledger-btn" onClick={() => openEditModal(doc)}>
                  <FaEdit /> Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT DOCTOR DETAILS MODAL */}
      {editingDoctor && (
        <div className="edit-modal-backdrop">
          <div className="edit-modal-card glass-panel" style={{ width: "480px" }}>
            <div className="modal-header">
              <FaStethoscope className="modal-shield-icon" />
              <div>
                <h3>Edit Doctor Details</h3>
                <p>Modify local operating parameters. Doctor ID and Contact numbers are system locked.</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group-custom">
                <label>System Doctor ID (Locked)</label>
                <div className="input-with-icon">
                  <FaLock />
                  <input type="text" value={editingDoctor.doctor_id} disabled style={{ background: "#cbd5e1", color: "#64748b" }} />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Phone Number (Locked)</label>
                <div className="input-with-icon">
                  <FaLock />
                  <input type="tel" value={editingDoctor.mobile} disabled style={{ background: "#cbd5e1", color: "#64748b" }} />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-custom">
                <label>Academic Degrees</label>
                <input 
                  type="text" 
                  value={editDegree}
                  placeholder="e.g. B.V.Sc & A.H, M.V.Sc"
                  onChange={(e) => setEditDegree(e.target.value)}
                />
              </div>

              <div className="form-group-custom">
                <label>Specialization Scope</label>
                <input 
                  type="text" 
                  value={editSpecialty}
                  placeholder="e.g. Bovine Health (Cattle)"
                  onChange={(e) => setEditSpecialty(e.target.value)}
                />
              </div>

              <div className="form-group-custom">
                <label>Operating Region</label>
                <input 
                  type="text" 
                  value={editRegion}
                  placeholder="e.g. Kolar, Karnataka"
                  onChange={(e) => setEditRegion(e.target.value)}
                />
              </div>

              <div className="form-group-custom">
                <label>Commission Percentage (%)</label>
                <input 
                  type="text" 
                  value={editCommissionRate}
                  placeholder="e.g. 5%"
                  onChange={(e) => setEditCommissionRate(e.target.value)}
                />
              </div>

              <div className="form-group-custom">
                <label>Aadhaar Proof Number</label>
                <input 
                  type="text" 
                  value={editAadhaar}
                  placeholder="xxxx-xxxx-xxxx"
                  onChange={(e) => setEditAadhaar(e.target.value)}
                />
              </div>

              <div className="form-group-custom">
                <label>PAN Proof Number</label>
                <input 
                  type="text" 
                  value={editPan}
                  placeholder="ABCDE1234F"
                  onChange={(e) => setEditPan(e.target.value)}
                />
              </div>

              <div className="form-group-custom">
                <label>Clinic Address</label>
                <textarea 
                  value={editAddress}
                  rows={2}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    background: "var(--bg-app)",
                    padding: "8px 14px",
                    fontSize: "13px",
                    color: "var(--text-main)",
                    outline: "none",
                    fontFamily: "inherit"
                  }}
                  onChange={(e) => setEditAddress(e.target.value)}
                />
              </div>

              <div className="modal-actions-footer">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setEditingDoctor(null)}
                >
                  <FaTimes /> Cancel
                </button>
                <button type="submit" className="save-btn">
                  <FaCheck /> Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
