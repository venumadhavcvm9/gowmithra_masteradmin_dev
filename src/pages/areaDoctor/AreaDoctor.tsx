// src/pages/areaDoctor/AreaDoctor.tsx

import "./areaDoctor.css";
import { useEffect, useState } from "react";
import {
  getDoctors,
  updateDoctorStatus,
  updateDoctorDetails,
  createDoctor
} from "./areaDoctor.service";
import type { Doctor } from "./areaDoctor.service";
import {
  FaSearch,
  FaStethoscope,
  FaPlus,
  FaPhoneAlt,
  FaMapMarkerAlt,
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

  // Create Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newAadhaar, setNewAadhaar] = useState("");

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

  // Save Create Handler
  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newMobile) {
      toast.error("Full Name and Mobile are required.");
      return;
    }

    const loadToast = toast.loading("Onboarding new area doctor...");
    createDoctor({
      full_name: newFullName,
      mobile: newMobile,
      address: newAddress,
      aadhaar: newAadhaar,
    })
      .then(() => {
        toast.success("Area Doctor successfully onboarded!", { id: loadToast });
        setIsCreateModalOpen(false);
        setNewFullName("");
        setNewMobile("");
        setNewAddress("");
        setNewAadhaar("");
        loadDoctors();
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || "Failed to onboard doctor.", { id: loadToast });
      });
  };

  return (
    <div className="doctors-page">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="doctors-top-bar">
        <div>
          <h1 className="text-gradient">Area Veterinarians Network</h1>
          <p>Onboard, coordinate, and review operating commissions for localized field doctors.</p>
        </div>
        <button className="add-doctor-btn" onClick={() => setIsCreateModalOpen(true)}>
          <FaPlus />
          <span>Onboard Doctor</span>
        </button>
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

      {/* DOCTORS TABLE */}
      {isLoading ? (
        <div className="table-loading">Querying Veterinarians Register...</div>
      ) : (
        <div className="table-responsive glass-panel">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Identity & Contact</th>
                <th>Region</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doc, idx) => {
                const isActive = (doc.status || "ACTIVE") === "ACTIVE";
                return (
                  <tr key={idx} className={!isActive ? "row-muted" : ""}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="avatar-placeholder" style={{ width: "40px", height: "40px", fontSize: "16px", flexShrink: 0 }}>
                          {doc.full_name.charAt(0)}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong style={{ color: "var(--text-main)", fontSize: "14px" }}>{doc.full_name}</strong>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{doc.degree || "B.V.Sc & A.H"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaPhoneAlt color="var(--text-muted)" size={12} />
                          <strong>{doc.mobile}</strong>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaIdCard color="var(--text-muted)" size={12} />
                          <span><strong>{doc.aadhaar || "N/A"}</strong></span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                        <FaMapMarkerAlt color="var(--accent-blue)" size={14} />
                        <strong>{doc.region || "Hyderabad, Telangana"}</strong>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${isActive ? "active" : "inactive"}`}>
                        <span className="status-dot"></span>
                        {isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button
                          className={`action-btn-toggle ${isActive ? "active" : ""}`}
                          onClick={() => handleStatusToggle(doc)}
                          title={isActive ? "Hide Doctor" : "Activate Doctor"}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-color)",
                            background: isActive ? "transparent" : "var(--bg-app)",
                            color: isActive ? "var(--text-muted)" : "var(--text-main)",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          {isActive ? "Hide" : "Activate"}
                        </button>
                        <button
                          className="action-btn-icon edit"
                          onClick={() => openEditModal(doc)}
                          title="Edit Details"
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-color)",
                            background: "transparent",
                            color: "var(--accent-blue)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <FaEdit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No doctors found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* CREATE DOCTOR MODAL */}
      {isCreateModalOpen && (
        <div className="edit-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="edit-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-shield-icon">
                <FaStethoscope />
              </div>
              <div>
                <h3>Onboard Area Veterinarian</h3>
                <p>Register a new localized field doctor to the master registry.</p>
              </div>
            </div>

            <form onSubmit={handleCreateDoctor} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group-custom">
                <label>Legal Full Name <span style={{ color: "var(--accent-rose)" }}>*</span></label>
                <input
                  type="text"
                  value={newFullName}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-custom">
                <label>Mobile Number <span style={{ color: "var(--accent-rose)" }}>*</span></label>
                <input
                  type="text"
                  value={newMobile}
                  placeholder="10-digit mobile number"
                  onChange={(e) => setNewMobile(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-custom">
                <label>Aadhaar Proof Number</label>
                <input
                  type="text"
                  value={newAadhaar}
                  placeholder="xxxx-xxxx-xxxx"
                  onChange={(e) => setNewAadhaar(e.target.value)}
                />
              </div>
              <div className="form-group-custom">
                <label>Clinic/Operating Address</label>
                <textarea
                  value={newAddress}
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
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <FaTimes /> Cancel
                </button>
                <button type="submit" className="save-btn">
                  <FaCheck /> Onboard Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
