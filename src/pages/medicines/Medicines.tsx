// src/pages/medicines/Medicines.tsx

import "./medicines.css";
import { useEffect, useState } from "react";
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  toggleMedicineStatus,
} from "./medicines.service";
import type { Medicine, MedicineType } from "./medicines.service";
import { getCurrentUser } from "../../services/auth";
import {
  FaPlus,
  FaSearch,
  FaCapsules,
  FaEdit,
  FaTimes,
  FaCheck,
  FaUpload,
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

const MEDICINE_TYPES: MedicineType[] = [
  "ANTIBIOTIC",
  "INJECTABLE",
  "HORMONAL",
  "STRONG_ANTIPARASITIC",
  "VACCINE",
  "DEWORMER",
  "ECTOPARASITE",
  "SUPPLEMENT",
  "TOPICAL",
  "FEED_ADDITIVE",
];

const MEDICINE_CATEGORIES = [
  "Supplements",
  "First Aid",
  "Feed Additives",
];

const MEDICINE_SUB_CATEGORIES = [
  "Powder",
  "injection",
  "tablet",
  "syrup",
];

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `http://localhost:5000${path}`;
};

export default function Medicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormThumbnail(e.dataTransfer.files[0]);
    }
  };

  const currentUser = getCurrentUser();
  const canManage = ["STOCK", "ADMIN", "MASTER_ADMIN"].includes(currentUser?.role || "");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form states
  const [formMedicineId, setFormMedicineId] = useState("");
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formBatchNumber, setFormBatchNumber] = useState("");
  const [formMfgDate, setFormMfgDate] = useState("");
  const [formExpDate, setFormExpDate] = useState("");
  const [formThumbnail, setFormThumbnail] = useState<File | string | null>(null);
  const [formRequiresPrescription, setFormRequiresPrescription] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const [formSubCategory, setFormSubCategory] = useState("");
  const [formType, setFormType] = useState<MedicineType>("SUPPLEMENT");
  const [formShowToUsers, setFormShowToUsers] = useState(true);
  const [formReorderLevel, setFormReorderLevel] = useState(10);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    loadMedicines();
  }, [currentPage, limit, debouncedSearch, categoryFilter, typeFilter, statusFilter]);

  const loadMedicines = () => {
    setIsLoading(true);
    getMedicines({
      page: currentPage,
      limit,
      search: debouncedSearch,
      category: categoryFilter !== "All" ? categoryFilter : undefined,
      type: typeFilter !== "All" ? typeFilter : undefined,
      status: statusFilter !== "All" ? statusFilter : undefined
    })
      .then((res) => {
        setMedicines(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalItems(res.meta.totalItems);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load medicine listings.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleToggleStatus = (med: Medicine) => {
    if (!canManage) {
      toast.error("Access denied. Only Stock management employees can toggle active status.");
      return;
    }

    const nextStatusText = med.is_active ? "Deactivating..." : "Activating...";
    const loadToast = toast.loading(nextStatusText);

    toggleMedicineStatus(med.id)
      .then((res) => {
        toast.success(`Medicine status updated to ${res.is_active ? "Active" : "Inactive"}.`, {
          id: loadToast,
        });
        loadMedicines();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update status.", { id: loadToast });
      });
  };

  const openAddModal = () => {
    setFormMedicineId("");
    setFormName("");
    setFormPrice(0);
    setFormBatchNumber("");
    setFormMfgDate("");
    setFormExpDate("");
    setFormThumbnail(null);
    setFormRequiresPrescription(false);
    setFormCategory("");
    setFormSubCategory("");
    setFormType("SUPPLEMENT");
    setFormShowToUsers(true);
    setFormReorderLevel(10);
    setShowAddModal(true);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setFormMedicineId(med.medicine_id);
    setFormName(med.name);
    setFormPrice(med.price);
    setFormBatchNumber(med.batch_number || "");
    setFormMfgDate(med.mfg_date ? med.mfg_date.split("T")[0] : "");
    setFormExpDate(med.exp_date ? med.exp_date.split("T")[0] : "");
    setFormThumbnail(med.thumbnail || null);
    setFormRequiresPrescription(med.requires_prescription);
    setFormCategory(med.category);
    setFormSubCategory(med.sub_category);
    setFormType(med.type);
    setFormShowToUsers(med.show_to_users);
    setFormReorderLevel(med.reorder_level ?? 10);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    const payload = new FormData();
    payload.append("medicine_id", formMedicineId);
    payload.append("name", formName);
    payload.append("price", formPrice.toString());
    if (formBatchNumber) payload.append("batch_number", formBatchNumber);
    if (formMfgDate) payload.append("mfg_date", formMfgDate);
    if (formExpDate) payload.append("exp_date", formExpDate);
    payload.append("requires_prescription", String(formRequiresPrescription));
    payload.append("category", formCategory);
    payload.append("sub_category", formSubCategory);
    payload.append("type", formType);
    payload.append("show_to_users", String(formShowToUsers));
    payload.append("reorder_level", formReorderLevel.toString());

    if (formThumbnail instanceof File) {
      payload.append("thumbnail", formThumbnail);
    } else if (typeof formThumbnail === "string" && formThumbnail) {
      payload.append("thumbnail", formThumbnail);
    }

    const loadToast = toast.loading("Onboarding new medicine...");
    createMedicine(payload)
      .then(() => {
        toast.success("Medicine added successfully!", { id: loadToast });
        setShowAddModal(false);
        loadMedicines();
      })
      .catch((err) => {
        console.error(err);
        const errMsg = err.response?.data?.message || "Failed to create medicine.";
        toast.error(errMsg, { id: loadToast });
      });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine || !canManage) return;

    const payload = new FormData();
    payload.append("name", formName);
    payload.append("price", formPrice.toString());
    if (formBatchNumber) payload.append("batch_number", formBatchNumber);
    if (formMfgDate) payload.append("mfg_date", formMfgDate);
    if (formExpDate) payload.append("exp_date", formExpDate);
    payload.append("requires_prescription", String(formRequiresPrescription));
    payload.append("category", formCategory);
    payload.append("sub_category", formSubCategory);
    payload.append("type", formType);
    payload.append("show_to_users", String(formShowToUsers));
    payload.append("reorder_level", formReorderLevel.toString());

    if (formThumbnail instanceof File) {
      payload.append("thumbnail", formThumbnail);
    } else if (typeof formThumbnail === "string" && formThumbnail) {
      payload.append("thumbnail", formThumbnail);
    }

    const loadToast = toast.loading("Updating medicine details...");
    updateMedicine(editingMedicine.id, payload)
      .then(() => {
        toast.success("Medicine updated successfully!", { id: loadToast });
        setEditingMedicine(null);
        loadMedicines();
      })
      .catch((err) => {
        console.error(err);
        const errMsg = err.response?.data?.message || "Failed to update medicine.";
        toast.error(errMsg, { id: loadToast });
      });
  };

  // Extract unique categories for filter list is removed because pagination breaks it.
  // We will change the category dropdown to a text input.

  // Analytics helper metrics (Server provides totalItems)
  // const totalCatalog = totalItems;

  return (
    <div className="medicines-page">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="medicines-top-bar">
        <div>
          <h1 className="text-gradient">Catalog Health</h1>
          <p>
            {canManage
              ? "Onboard products, adjust batch info, and set prescription triggers."
              : "Read-only access: View vet packages, supplements, and feed catalog lists."}
          </p>
        </div>
        {canManage && (
          <button className="add-medicine-btn" onClick={openAddModal}>
            <FaPlus />
            <span>Add Medicine</span>
          </button>
        )}
      </div>



      {/* CONTROLS PANELS */}
      <div className="medicines-controls glass-panel">
        <div className="search-group">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by product name or medicine ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="filter-select">
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Categories</option>
              {MEDICINE_CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Types</option>
              {MEDICINE_TYPES.map((t, idx) => (
                <option key={idx} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* MEDICINES LIST GRID */}
      {isLoading ? (
        <div className="table-loading">Querying Inventory Registers...</div>
      ) : medicines.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}
        >
          No medicines found matching selected filters.
        </div>
      ) : (
        <div className="table-responsive glass-panel">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Type</th>
                <th>Batch & Dates</th>
                <th>Price</th>
                <th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {med.thumbnail ? (
                        <img 
                          src={getImageUrl(med.thumbnail)} 
                          alt={med.name} 
                          style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} 
                          onError={(e) => {
                            e.currentTarget.onerror = null; // prevents looping
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f1f5f9' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2394a3b8'%3E?%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--card-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaCapsules style={{ fontSize: "20px", color: "var(--accent-blue)" }} />
                        </div>
                      )}
                      <div>
                        <strong style={{ display: "block" }}>{med.name}</strong>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{med.medicine_id}</span>
                        {med.requires_prescription && (
                          <span style={{ display: "inline-block", fontSize: "10px", backgroundColor: "var(--accent-rose)", color: "#fff", padding: "2px 6px", borderRadius: "4px", marginLeft: "6px" }}>Rx</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: "block", fontSize: "14px" }}>{med.category || "N/A"}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{med.sub_category || "N/A"}</span>
                  </td>
                  <td>
                    {med.type ? med.type.replace(/_/g, " ") : "N/A"}
                  </td>
                  <td>
                    <span style={{ display: "block", fontSize: "13px" }}>Batch: {med.batch_number || "N/A"}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Mfg: {med.mfg_date ? med.mfg_date.split("T")[0] : "N/A"} | Exp: {med.exp_date ? med.exp_date.split("T")[0] : "N/A"}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--primary)", fontSize: "15px" }}>₹{med.price.toFixed(2)}</strong>
                  </td>
                  <td>
                    <span className={`status-pill ${med.is_active ? "delivered" : "cancelled"}`}>
                      <span className="status-dot"></span>
                      {med.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {canManage && (
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleToggleStatus(med)}
                          style={{
                            background: "transparent",
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--text-muted)"}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                        >
                          {med.is_active ? "Hide" : "Show"}
                        </button>
                        <button
                          onClick={() => openEditModal(med)}
                          style={{
                            background: "var(--accent-blue)",
                            border: "none",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                        >
                          <FaEdit /> Edit
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              Showing {medicines.length} of {totalItems} items
            </span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-main)", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <span style={{ fontSize: "14px", color: "var(--text-main)", fontWeight: 500 }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-main)", cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer", opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEDICINE MODAL */}
      {showAddModal && (
        <div className="edit-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="edit-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <FaCapsules className="modal-shield-icon" />
              <div>
                <h3>Onboard New Medicine</h3>
                <p>Register veterinary catalog products into the central inventory warehouse.</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-grid-2">
                <div className="form-group-custom">
                  <label>Medicine ID (Auto-generated)</label>
                  <input
                    type="text"
                    value="Auto-generated"
                    disabled
                    style={{ background: "#cbd5e1", color: "#64748b", cursor: "not-allowed" }}
                  />
                </div>

                <div className="form-group-custom">
                  <label>Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Calcium Vet Forte 1L"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-custom">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label>Batch Number</label>
                  <input
                    type="text"
                    placeholder="e.g. B-CF-908"
                    value={formBatchNumber}
                    onChange={(e) => setFormBatchNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-custom">
                  <label>Mfg Date</label>
                  <input
                    type="date"
                    value={formMfgDate}
                    onChange={(e) => setFormMfgDate(e.target.value)}
                  />
                </div>

                <div className="form-group-custom">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={formExpDate}
                    onChange={(e) => setFormExpDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-custom">
                  <label>Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    {MEDICINE_CATEGORIES.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-custom">
                  <label>Sub Category</label>
                  <select
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Sub Category</option>
                    {MEDICINE_SUB_CATEGORIES.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-custom">
                  <label>Type Scope</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as MedicineType)}
                  >
                    {MEDICINE_TYPES.map((t, idx) => (
                      <option key={idx} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-custom">
                  <label>Reorder Level (Alert Threshold)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={formReorderLevel}
                    onChange={(e) => setFormReorderLevel(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                  Thumbnail Image
                </span>
                <div
                  style={{
                    border: `2px dashed ${dragActive ? '#10b981' : '#cbd5e1'}`,
                    backgroundColor: dragActive ? 'rgba(16, 185, 129, 0.1)' : '#f8fafc',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '16px',
                    minHeight: '160px',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  {formThumbnail ? (
                    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', padding: '8px', backgroundColor: 'white' }}>
                      <img
                        src={formThumbnail instanceof File ? URL.createObjectURL(formThumbnail) : getImageUrl(formThumbnail as string)}
                        alt="Thumbnail Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
                        onError={(e) => {
                          // Automatically remove broken images (like old fake database URLs)
                          setFormThumbnail(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormThumbnail(null)}
                        style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <FaUpload style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '4px' }} />
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#475569', margin: 0 }}>Drag Thumbnail Image Here</p>
                        <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0 0' }}>Or browse on machine files</p>
                      </div>
                      <label style={{ cursor: 'pointer', display: 'inline-block', backgroundColor: '#e2e8f0', padding: '6px 14px', borderRadius: '8px', fontSize: '10px', fontWeight: 600, color: '#334155', marginTop: '8px', transition: 'background-color 0.2s' }}>
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setFormThumbnail(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="checkbox-group-custom">
                <label>Access Visibility & Prescription Triggers</label>
                <div className="checkbox-row">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formRequiresPrescription}
                      onChange={(e) => setFormRequiresPrescription(e.target.checked)}
                    />
                    Requires Prescription
                  </label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formShowToUsers}
                      onChange={(e) => setFormShowToUsers(e.target.checked)}
                    />
                    Show to Farmers
                  </label>


                </div>
              </div>

              <div className="modal-actions-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  <FaTimes /> Cancel
                </button>
                <button type="submit" className="save-btn">
                  <FaCheck /> Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEDICINE MODAL */}
      {editingMedicine && (
        <div className="edit-modal-backdrop" onClick={() => setEditingMedicine(null)}>
          <div className="edit-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <FaCapsules className="modal-shield-icon" />
              <div>
                <h3>Edit Medicine Details</h3>
                <p>Modify local operating parameters. Medicine ID is system locked.</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-grid-2">
                <div className="form-group-custom">
                  <label>Medicine ID (Locked)</label>
                  <input
                    type="text"
                    value={formMedicineId}
                    disabled
                    style={{ background: "#cbd5e1", color: "#64748b", cursor: "not-allowed" }}
                  />
                </div>

                <div className="form-group-custom">
                  <label>Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Calcium Vet Forte 1L"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-custom">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label>Batch Number</label>
                  <input
                    type="text"
                    placeholder="e.g. B-CF-908"
                    value={formBatchNumber}
                    onChange={(e) => setFormBatchNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-custom">
                  <label>Mfg Date</label>
                  <input
                    type="date"
                    value={formMfgDate}
                    onChange={(e) => setFormMfgDate(e.target.value)}
                  />
                </div>

                <div className="form-group-custom">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={formExpDate}
                    onChange={(e) => setFormExpDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-custom">
                  <label>Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    {MEDICINE_CATEGORIES.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-custom">
                  <label>Sub Category</label>
                  <select
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Sub Category</option>
                    {MEDICINE_SUB_CATEGORIES.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-custom">
                  <label>Type Scope</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as MedicineType)}
                  >
                    {MEDICINE_TYPES.map((t, idx) => (
                      <option key={idx} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-custom">
                  <label>Reorder Level (Alert Threshold)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={formReorderLevel}
                    onChange={(e) => setFormReorderLevel(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                  Thumbnail Image
                </span>
                <div
                  style={{
                    border: `2px dashed ${dragActive ? '#10b981' : '#cbd5e1'}`,
                    backgroundColor: dragActive ? 'rgba(16, 185, 129, 0.1)' : '#f8fafc',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '16px',
                    minHeight: '160px',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  {formThumbnail ? (
                    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', padding: '8px', backgroundColor: 'white' }}>
                      <img
                        src={formThumbnail instanceof File ? URL.createObjectURL(formThumbnail) : getImageUrl(formThumbnail as string)}
                        alt="Thumbnail Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
                        onError={(e) => {
                          // Automatically remove broken images (like old fake database URLs)
                          setFormThumbnail(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormThumbnail(null)}
                        style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <FaUpload style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '4px' }} />
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#475569', margin: 0 }}>Drag Receipt Image Here</p>
                        <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0 0' }}>Or browse on machine files</p>
                      </div>
                      <label style={{ cursor: 'pointer', display: 'inline-block', backgroundColor: '#e2e8f0', padding: '6px 14px', borderRadius: '8px', fontSize: '10px', fontWeight: 600, color: '#334155', marginTop: '8px', transition: 'background-color 0.2s' }}>
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setFormThumbnail(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="checkbox-group-custom">
                <label>Access Visibility & Prescription Triggers</label>
                <div className="checkbox-row">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formRequiresPrescription}
                      onChange={(e) => setFormRequiresPrescription(e.target.checked)}
                    />
                    Requires Prescription
                  </label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formShowToUsers}
                      onChange={(e) => setFormShowToUsers(e.target.checked)}
                    />
                    Show to Farmers
                  </label>


                </div>
              </div>

              <div className="modal-actions-footer">
                <button type="button" className="cancel-btn" onClick={() => setEditingMedicine(null)}>
                  <FaTimes /> Cancel
                </button>
                <button type="submit" className="save-btn">
                  <FaCheck /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
