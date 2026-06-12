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
  FaExclamationTriangle,
  FaBoxes,
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
  "Feed additives",
];

const MEDICINE_SUB_CATEGORIES = [
  "Powder",
  "injection",
  "tablet",
  "syrup",
];

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
  const [limit, setLimit] = useState(10);

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
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formRequiresPrescription, setFormRequiresPrescription] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const [formSubCategory, setFormSubCategory] = useState("");
  const [formType, setFormType] = useState<MedicineType>("SUPPLEMENT");
  const [formShowToUsers, setFormShowToUsers] = useState(true);
  const [formShowToShops, setFormShowToShops] = useState(true);
  const [formShowToVendors, setFormShowToVendors] = useState(true);
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
    setFormThumbnail("");
    setFormRequiresPrescription(false);
    setFormCategory("");
    setFormSubCategory("");
    setFormType("SUPPLEMENT");
    setFormShowToUsers(true);
    setFormShowToShops(true);
    setFormShowToVendors(true);
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
    setFormThumbnail(med.thumbnail || "");
    setFormRequiresPrescription(med.requires_prescription);
    setFormCategory(med.category);
    setFormSubCategory(med.sub_category);
    setFormType(med.type);
    setFormShowToUsers(med.show_to_users);
    setFormShowToShops(med.show_to_shops);
    setFormShowToVendors(med.show_to_vendors);
    setFormReorderLevel(med.reorder_level ?? 10);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    const payload = {
      medicine_id: formMedicineId,
      name: formName,
      price: Number(formPrice),
      batch_number: formBatchNumber || undefined,
      mfg_date: formMfgDate || undefined,
      exp_date: formExpDate || undefined,
      thumbnail: formThumbnail || undefined,
      requires_prescription: formRequiresPrescription,
      category: formCategory,
      sub_category: formSubCategory,
      type: formType,
      show_to_users: formShowToUsers,
      show_to_shops: formShowToShops,
      show_to_vendors: formShowToVendors,
      reorder_level: Number(formReorderLevel),
    };

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

    const payload: Partial<Medicine> = {
      name: formName,
      price: Number(formPrice),
      batch_number: formBatchNumber,
      mfg_date: formMfgDate || undefined,
      exp_date: formExpDate || undefined,
      thumbnail: formThumbnail,
      requires_prescription: formRequiresPrescription,
      category: formCategory,
      sub_category: formSubCategory,
      type: formType,
      show_to_users: formShowToUsers,
      show_to_shops: formShowToShops,
      show_to_vendors: formShowToVendors,
      reorder_level: Number(formReorderLevel),
    };

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
  const totalCatalog = totalItems;

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
                        <img src={med.thumbnail} alt={med.name} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />
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

              <div className="form-group-custom" style={{ marginTop: "1rem" }}>
                <label>Thumbnail Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                />
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

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formShowToShops}
                      onChange={(e) => setFormShowToShops(e.target.checked)}
                    />
                    Show to Shops
                  </label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formShowToVendors}
                      onChange={(e) => setFormShowToVendors(e.target.checked)}
                    />
                    Show to Vendors
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

              <div className="form-group-custom" style={{ marginTop: "1rem" }}>
                <label>Thumbnail Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                />
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

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formShowToShops}
                      onChange={(e) => setFormShowToShops(e.target.checked)}
                    />
                    Show to Shops
                  </label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formShowToVendors}
                      onChange={(e) => setFormShowToVendors(e.target.checked)}
                    />
                    Show to Vendors
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
