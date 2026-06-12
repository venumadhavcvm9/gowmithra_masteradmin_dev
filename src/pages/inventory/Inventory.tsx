import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import api from "../../services/api";
import {
  FaWarehouse,
  FaStore,
  FaExchangeAlt,
  FaPlus,
  FaHistory,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  getAgencyStock,
  getShopStock,
  getLedger,
  addInwardStock,
  transferStockToShop,
} from "./inventory.service";
import type { InventoryStock, InventoryLedger } from "./inventory.service";
import { getCurrentUser } from "../../services/auth";
import "./Inventory.css";

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"AGENCY" | "SHOP" | "LEDGER" | "ALERTS">("AGENCY");
  const [isLoading, setIsLoading] = useState(false);

  const [agencyStock, setAgencyStock] = useState<InventoryStock[]>([]);
  const [shopStock, setShopStock] = useState<InventoryStock[]>([]);
  const [ledger, setLedger] = useState<{ data: InventoryLedger[]; totalPages: number; page: number }>({
    data: [],
    totalPages: 1,
    page: 1,
  });

  // Modals
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Lookups
  const [medicines, setMedicines] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);

  // Auth Context
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "MASTER_ADMIN";

  useEffect(() => {
    loadData();
    if (isAdmin) {
      loadLookups();
    }
  }, [activeTab]);

  const loadLookups = async () => {
    try {
      const medRes = await api.get("/medicines");
      setMedicines(medRes.data.data || []);
      const shopRes = await api.get("/shops");
      setShops(shopRes.data.data || []);
    } catch (err) {
      console.error("Failed to load lookups", err);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "AGENCY") {
        const res = await getAgencyStock({});
        setAgencyStock(res.data);
      } else if (activeTab === "SHOP") {
        const res = await getShopStock({});
        setShopStock(res.data);
      } else if (activeTab === "LEDGER") {
        const res = await getLedger({ page: 1, limit: 50, type: "TRANSFER_TO_SHOP" });
        setLedger({ data: res.data, totalPages: res.pages, page: res.page });
      } else if (activeTab === "ALERTS") {
        const [resA, resS] = await Promise.all([
          getAgencyStock({}),
          getShopStock({})
        ]);
        setAgencyStock(resA.data);
        setShopStock(resS.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      medicine_id: Number(formData.get("medicine_id")),
      quantity: Number(formData.get("quantity")),
      batch_number: formData.get("batch_number") as string,
      expiry_date: formData.get("expiry_date") as string,
      notes: formData.get("notes") as string,
    };

    const loadToast = toast.loading("Adding inward stock...");
    try {
      await addInwardStock(payload);
      toast.success("Inward stock added!", { id: loadToast });
      setShowInwardModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add stock", { id: loadToast });
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      medicine_id: Number(formData.get("medicine_id")),
      to_shop_id: Number(formData.get("to_shop_id")),
      quantity: Number(formData.get("quantity")),
      batch_number: formData.get("batch_number") as string,
      notes: formData.get("notes") as string,
    };

    const loadToast = toast.loading("Transferring stock...");
    try {
      await transferStockToShop(payload);
      toast.success("Stock transferred to shop!", { id: loadToast });
      setShowTransferModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to transfer", { id: loadToast });
    }
  };

  return (
    <div className="inventory-page">
      <Toaster position="top-right" />
      <div className="inventory-top-bar">
        <div>
          <h1 className="text-gradient">Inventory & Stocks</h1>
          <p>Manage central agency stocks and distribute to regional shops.</p>
        </div>
        {isAdmin && (
          <div className="inventory-actions">
            <button className="primary-btn" onClick={() => setShowInwardModal(true)}>
              <FaPlus /> Add Inward Stock
            </button>
            <button className="secondary-btn" onClick={() => setShowTransferModal(true)}>
              <FaExchangeAlt /> Dispatch to Shop
            </button>
          </div>
        )}
      </div>

      <div className="inventory-tabs glass-panel">
        <button
          className={`tab-btn ${activeTab === "AGENCY" ? "active" : ""}`}
          onClick={() => setActiveTab("AGENCY")}
        >
          <FaWarehouse /> Central Agency Stock
        </button>
        <button
          className={`tab-btn ${activeTab === "SHOP" ? "active" : ""}`}
          onClick={() => setActiveTab("SHOP")}
        >
          <FaStore /> Shop Inventories
        </button>
        <button
          className={`tab-btn ${activeTab === "LEDGER" ? "active" : ""}`}
          onClick={() => setActiveTab("LEDGER")}
        >
          <FaHistory /> Stock Ledger
        </button>
        <button
          className={`tab-btn ${activeTab === "ALERTS" ? "active" : ""}`}
          onClick={() => setActiveTab("ALERTS")}
          style={{ color: "var(--accent-rose)" }}
        >
          <FaExclamationTriangle /> Alerts Dashboard
        </button>
      </div>

      <div className="inventory-content glass-panel">
        {isLoading ? (
          <div className="table-loading">Loading inventory data...</div>
        ) : activeTab === "ALERTS" ? (
          <div className="alerts-dashboard">
            <h3 style={{ color: "var(--accent-rose)", marginBottom: "1rem" }}>
              <FaExclamationTriangle /> Low Stock Alerts (Central Agency)
            </h3>
            <div className="table-responsive" style={{ marginBottom: "2rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Current Quantity</th>
                    <th>Reorder Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const agencyGrouped = agencyStock.reduce((acc, stock) => {
                      const medId = stock.medicine_id;
                      if (!acc[medId]) {
                        acc[medId] = { medicine: stock.medicine, quantity: 0 };
                      }
                      acc[medId].quantity += stock.quantity;
                      return acc;
                    }, {} as any);
                    
                    const lowStockAlerts: any[] = [];
                    Object.values(agencyGrouped).forEach((item: any) => {
                      // @ts-ignore
                      const reorderLevel = item.medicine?.reorder_level ?? 10;
                      if (item.quantity < reorderLevel) {
                        lowStockAlerts.push({ ...item, reorder_level: reorderLevel });
                      }
                    });

                    if (lowStockAlerts.length === 0) {
                      return <tr><td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>No low stock alerts</td></tr>;
                    }

                    return lowStockAlerts.map((alert, idx) => (
                      <tr key={idx}>
                        <td><strong>{alert.medicine?.name}</strong></td>
                        <td><strong style={{ color: "var(--accent-rose)" }}>{alert.quantity}</strong></td>
                        <td>{alert.reorder_level}</td>
                        <td><span className="qty-badge low-stock">Needs Reorder</span></td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <h3 style={{ color: "var(--accent-orange)", marginBottom: "1rem" }}>
              <FaExclamationTriangle /> Expiring Soon (Within 90 Days)
            </h3>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Medicine Name</th>
                    <th>Batch Number</th>
                    <th>Expiry Date</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const expiringAlerts: any[] = [];
                    const today = new Date();
                    const ninetyDaysFromNow = new Date();
                    ninetyDaysFromNow.setDate(today.getDate() + 90);

                    const checkExpiry = (stock: any, location: string) => {
                      if (stock.expiry_date && stock.quantity > 0) {
                        const expDate = new Date(stock.expiry_date);
                        if (expDate <= ninetyDaysFromNow) {
                          expiringAlerts.push({ ...stock, location });
                        }
                      }
                    };

                    agencyStock.forEach(s => checkExpiry(s, "Agency"));
                    shopStock.forEach(s => checkExpiry(s, s.shop?.name || `Shop ${s.shop_id}`));

                    if (expiringAlerts.length === 0) {
                      return <tr><td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>No expiring stock alerts</td></tr>;
                    }

                    return expiringAlerts.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()).map((alert, idx) => (
                      <tr key={idx}>
                        <td>{alert.location}</td>
                        <td><strong>{alert.medicine?.name}</strong></td>
                        <td>{alert.batch_number}</td>
                        <td><strong style={{ color: "var(--accent-orange)" }}>{alert.expiry_date}</strong></td>
                        <td>{alert.quantity}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "AGENCY" ? (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Medicine ID</th>
                  <th>Medicine Name</th>
                  <th>Batch Number</th>
                  <th>Expiry Date</th>
                  <th>Quantity Available</th>
                </tr>
              </thead>
              <tbody>
                {agencyStock.map((stock) => (
                  <tr key={stock.id}>
                    <td>{stock.medicine_id}</td>
                    <td><strong>{stock.medicine?.name}</strong></td>
                    <td>{stock.batch_number}</td>
                    <td>{stock.expiry_date}</td>
                    <td>
                      <span className={`qty-badge ${stock.quantity < 10 ? 'low-stock' : ''}`}>
                        {stock.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
                {agencyStock.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>No stock in agency</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === "SHOP" ? (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Medicine Name</th>
                  <th>Batch Number</th>
                  <th>Expiry Date</th>
                  <th>Quantity Available</th>
                </tr>
              </thead>
              <tbody>
                {shopStock.map((stock) => (
                  <tr key={stock.id}>
                    <td><strong>{stock.shop?.shop_id || `SH-${stock.shop_id}`}</strong> - {stock.shop?.name}</td>
                    <td>{stock.medicine?.name}</td>
                    <td>{stock.batch_number}</td>
                    <td>{stock.expiry_date}</td>
                    <td>
                      <span className={`qty-badge ${stock.quantity < 10 ? 'low-stock' : ''}`}>
                        {stock.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
                {shopStock.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>No stock in any shop</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Medicine</th>
                  <th>From (Agency)</th>
                  <th>To (Shop)</th>
                  <th>Transaction Type</th>
                  <th>Quantity</th>
                  <th>Batch No</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {ledger.data.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.createdAt).toLocaleString()}</td>
                    <td>{entry.medicine?.name}</td>
                    <td>Agency</td>
                    <td>{entry.to_shop_id ? `SH-${entry.to_shop_id}` : "-"}</td>
                    <td>
                      <span className={`txn-badge ${entry.transaction_type.toLowerCase()}`}>
                        {entry.transaction_type}
                      </span>
                    </td>
                    <td><strong>{entry.quantity}</strong></td>
                    <td>{entry.batch_number}</td>
                    <td>{entry.reference_id || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showInwardModal && (
        <div className="modal-backdrop" onClick={() => setShowInwardModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Add Inward Stock (To Agency)</h3>
            <form onSubmit={handleInwardSubmit}>
              <div className="form-group">
                <label>Medicine</label>
                <select name="medicine_id" required>
                  <option value="">Select a medicine...</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.medicine_id} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" required />
              </div>
              <div className="form-group">
                <label>Batch Number</label>
                <input type="text" name="batch_number" required />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="date" name="expiry_date" required />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input type="text" name="notes" placeholder="Invoice reference etc." />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowInwardModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Add Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="modal-backdrop" onClick={() => setShowTransferModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Dispatch Stock to Shop</h3>
            <form onSubmit={handleTransferSubmit}>
              <div className="form-group">
                <label>Medicine</label>
                <select name="medicine_id" required>
                  <option value="">Select a medicine...</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.medicine_id} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Target Shop</label>
                <select name="to_shop_id" required>
                  <option value="">Select a shop...</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shop_id} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Batch Number</label>
                <input type="text" name="batch_number" required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" required />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input type="text" name="notes" />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowTransferModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
