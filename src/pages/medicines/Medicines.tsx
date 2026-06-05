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

export default function Medicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const currentUser = getCurrentUser();
  const canManage = currentUser?.role === "STOCK";

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

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = () => {
    setIsLoading(true);
    getMedicines()
      .then((res) => {
        setMedicines(res.data);
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

  // Filters logic
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(search.toLowerCase()) ||
      med.medicine_id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || med.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesType = typeFilter === "All" || med.type === typeFilter;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && med.is_active) ||
      (statusFilter === "Inactive" && !med.is_active);

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Extract unique categories for filter list
  const categoriesList = Array.from(new Set(medicines.map((m) => m.category)));

  // Analytics helper metrics
  const totalCatalog = medicines.length;
  const activeCount = medicines.filter((m) => m.is_active).length;
  const prescriptionCount = medicines.filter((m) => m.requires_prescription).length;
  const supplementsCount = medicines.filter((m) => m.type === "SUPPLEMENT").length;

  return (
    <div className="medicines-page">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="medicines-top-bar">
        <div>
          <h1 className="text-gradient">Medicines & Catalog Controls</h1>
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

      {/* BANNER FOR NON-STOCK */}
      {!canManage && (
        <div
          className="glass-panel"
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            borderLeft: "4px solid var(--accent-amber)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <FaExclamationTriangle style={{ color: "var(--accent-amber)", fontSize: "20px" }} />
          <div>
            <strong style={{ color: "var(--secondary)", fontSize: "14px" }}>Read-Only View Enabled</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
              Your account role (<strong>{currentUser?.role}</strong>) does not have privileges to
              modify inventory. Product registration, active toggles, and price edits are locked to the{" "}
              <strong>STOCK</strong> role.
            </p>
          </div>
        </div>
      )}

      {/* METRICS CARD */}
      <div className="medicines-metrics">
        <div className="med-metric-box glass-panel">
          <span className="med-metric-title">Catalog Size</span>
          <h2>
            {totalCatalog} <FaBoxes className="inline-icon" />
          </h2>
          <span className="med-metric-sub text-up">{activeCount} Currently Active</span>
        </div>
        <div className="med-metric-box glass-panel">
          <span className="med-metric-title">Prescription Checked</span>
          <h2>{prescriptionCount} Products</h2>
          <span className="med-metric-sub" style={{ color: "var(--accent-rose)" }}>
            Requires doctor verification
          </span>
        </div>
        <div className="med-metric-box glass-panel">
          <span className="med-metric-title">Nutritional Supplements</span>
          <h2>{supplementsCount} Feeds</h2>
          <span className="med-metric-sub" style={{ color: "var(--accent-blue)" }}>
            Boosters and bulk calcium
          </span>
        </div>
        <div className="med-metric-box glass-panel">
          <span className="med-metric-title">Catalog Health</span>
          <h2>100%</h2>
          <span className="med-metric-sub text-up">All expiries monitored</span>
        </div>
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
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              {MEDICINE_TYPES.map((t, idx) => (
                <option key={idx} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
      ) : filteredMedicines.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}
        >
          No medicines found matching selected filters.
        </div>
      ) : (
        <div className="medicines-grid">
          {filteredMedicines.map((med) => (
            <div
              className={`medicine-card glass-panel card-hover-effect ${!med.is_active ? "inactive" : ""}`}
              key={med.id}
            >
              <div className="medicine-card-header">
                <div className="med-thumbnail-wrapper">
                  {med.thumbnail ? (
                    <img src={med.thumbnail} alt={med.name} className="med-thumbnail" />
                  ) : (
                    <FaCapsules className="med-placeholder-icon" />
                  )}
                </div>
                <div className="med-info-block">
                  <h3>{med.name}</h3>
                  <span className="med-id">{med.medicine_id}</span>
                  {med.requires_prescription && (
                    <span className="prescription-badge">Prescription Rx</span>
                  )}
                </div>
              </div>

              <div className="med-details-grid">
                <div>
                  <span>Category</span>
                  <strong>{med.category || "N/A"}</strong>
                </div>
                <div>
                  <span>Sub-category</span>
                  <strong>{med.sub_category || "N/A"}</strong>
                </div>
                <div>
                  <span>Batch No.</span>
                  <strong>{med.batch_number || "N/A"}</strong>
                </div>
                <div>
                  <span>Type</span>
                  <strong>{med.type ? med.type.replace(/_/g, " ") : "N/A"}</strong>
                </div>
                <div>
                  <span>Mfg Date</span>
                  <strong>{med.mfg_date ? med.mfg_date.split("T")[0] : "N/A"}</strong>
                </div>
                <div>
                  <span>Expiry Date</span>
                  <strong>{med.exp_date ? med.exp_date.split("T")[0] : "N/A"}</strong>
                </div>
              </div>

              <div className="med-price-row">
                <div className="med-price">
                  <span>PRICE</span>
                  <strong>₹{med.price.toFixed(2)}</strong>
                </div>

                <div className="med-actions">
                  {/* Status Toggle Switch */}
                  <div className="switch-container" onClick={() => handleToggleStatus(med)}>
                    <span className={`switch-label ${med.is_active ? "active" : ""}`}>
                      {med.is_active ? "Active" : "Inactive"}
                    </span>
                    <label className="switch" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={med.is_active}
                        disabled={!canManage}
                        onChange={() => handleToggleStatus(med)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  {canManage && (
                    <button className="med-edit-btn" onClick={() => openEditModal(med)}>
                      <FaEdit /> Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                  <label>Medicine ID (Required)</label>
                  <input
                    type="text"
                    placeholder="e.g. MED-0098"
                    value={formMedicineId}
                    onChange={(e) => setFormMedicineId(e.target.value)}
                    required
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
                  <input
                    type="text"
                    placeholder="e.g. Supplements"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label>Sub Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Calcium Liquids"
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    required
                  />
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
                  <label>Thumbnail Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                  />
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
                  <input
                    type="text"
                    placeholder="e.g. Supplements"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label>Sub Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Calcium Liquids"
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    required
                  />
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
                  <label>Thumbnail Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                  />
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
