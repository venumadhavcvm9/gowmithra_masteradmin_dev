import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { FaArrowLeft, FaBox, FaStore, FaHistory } from "react-icons/fa";
import { getLedger, getAgencyStock, getShopStock } from "./inventory.service";
import type { InventoryLedger, InventoryStock, Medicine } from "./inventory.service";
import "./Inventory.css";

const InventoryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [ledger, setLedger] = useState<InventoryLedger[]>([]);
  const [agencyStock, setAgencyStock] = useState<InventoryStock[]>([]);
  const [shopStock, setShopStock] = useState<InventoryStock[]>([]);
  const [medicine, setMedicine] = useState<Medicine | null>(null);

  useEffect(() => {
    if (id) {
      loadDetails(Number(id));
    }
  }, [id]);

  const loadDetails = async (medicineId: number) => {
    setIsLoading(true);
    try {
      const [ledgerRes, agencyRes, shopRes] = await Promise.all([
        getLedger({ limit: 50 }),
        getAgencyStock({}),
        getShopStock({})
      ]);

      const ledgerData = (ledgerRes.data || []).filter(
        (item: any) => item.medicine_id === medicineId && item.transaction_type !== "ORDER_FULFILLMENT"
      );
      setLedger(ledgerData);

      // Depending on API response structure, it could be inside 'data' property
      const aStockRaw = Array.isArray(agencyRes.data) ? agencyRes.data : Array.isArray(agencyRes) ? agencyRes : [];
      const sStockRaw = Array.isArray(shopRes.data) ? shopRes.data : Array.isArray(shopRes) ? shopRes : [];

      const aStock = aStockRaw.filter((item: any) => item.medicine_id === medicineId);
      const sStock = sStockRaw.filter((item: any) => item.medicine_id === medicineId);

      setAgencyStock(aStock);
      setShopStock(sStock);

      // Try to extract medicine details from the first available record
      if (ledgerData.length > 0 && ledgerData[0].medicine) {
        setMedicine(ledgerData[0].medicine);
      } else if (aStock.length > 0 && aStock[0].medicine) {
        setMedicine(aStock[0].medicine);
      } else if (sStock.length > 0 && sStock[0].medicine) {
        setMedicine(sStock[0].medicine);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load medicine details");
    } finally {
      setIsLoading(false);
    }
  };

  const totalAgencyQty = agencyStock.reduce((sum, s) => sum + s.quantity, 0);
  const totalShopQty = shopStock.reduce((sum, s) => sum + s.quantity, 0);

  // Group stock by shop
  const stockByShop = shopStock.reduce((acc: any, stock: any) => {
    const shopName = stock.shop ? stock.shop.name : `Shop ID: ${stock.shop_id}`;
    if (!acc[shopName]) {
      acc[shopName] = 0;
    }
    acc[shopName] += stock.quantity;
    return acc;
  }, {});

  return (
    <div className="inventory-page">
      <Toaster position="top-right" />
      <div className="inventory-top-bar" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button className="secondary-btn" onClick={() => navigate("/inventory")} style={{ padding: '8px 12px' }}>
          <FaArrowLeft /> Back
        </button>
        <div>
          <h1 className="text-gradient">Medicine Details: {medicine ? medicine.name : `ID #${id}`}</h1>
          <p>Detailed view of inward and outward stock movements.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="table-loading">Loading details...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              <FaBox size={30} color="var(--accent-blue)" style={{ marginBottom: '10px' }} />
              <h3>Central Agency Stock</h3>
              <h2 style={{ color: 'var(--accent-blue)', marginTop: '10px' }}>{totalAgencyQty}</h2>
            </div>
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              <FaStore size={30} color="var(--accent-teal)" style={{ marginBottom: '10px' }} />
              <h3>Stock at Shops</h3>
              <h2 style={{ color: 'var(--accent-teal)', marginTop: '10px' }}>{totalShopQty}</h2>
            </div>
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              <FaHistory size={30} color="var(--text-secondary)" style={{ marginBottom: '10px' }} />
              <h3>Total Transactions</h3>
              <h2 style={{ color: 'var(--text-main)', marginTop: '10px' }}>{ledger.length}</h2>
            </div>
          </div>

          {/* Stock Breakdown by Shop */}
          <div className="glass-panel">
            <h2 style={{ marginBottom: '15px' }}>Stock Breakdown by Shop</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              {Object.keys(stockByShop).length > 0 ? (
                Object.entries(stockByShop).map(([shopName, qty]) => (
                  <div key={shopName} style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                      <FaStore size={14} />
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '10px' }}>
                      <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem', lineHeight: '1.4' }}>{shopName}</span>
                      <span style={{ color: 'var(--accent-teal)', fontWeight: '800', fontSize: '1.5rem', lineHeight: 1 }}>{qty as React.ReactNode}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>No stock currently allocated to shops.</div>
              )}
            </div>
          </div>

          <div className="glass-panel">
            <h2 style={{ marginBottom: '15px' }}>Stock Ledger (Inward & Outward)</h2>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction Type</th>
                    <th>Quantity</th>
                    <th>Batch No</th>
                    <th>From (Agency)</th>
                    <th>To (Shop)</th>
                    <th>Reference / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry) => (
                    <tr key={entry.id}>
                      <td>{new Date(entry.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`txn-badge ${entry.transaction_type.toLowerCase()}`}>
                          {entry.transaction_type}
                        </span>
                      </td>
                      <td><strong>{entry.quantity}</strong></td>
                      <td>{entry.batch_number}</td>
                      <td>Agency</td>
                      <td>{entry.to_shop_id ? `SH-${entry.to_shop_id}` : "-"}</td>
                      <td>{entry.reference_id || entry.notes || "-"}</td>
                    </tr>
                  ))}
                  {ledger.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>No transactions found for this medicine.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default InventoryDetails;
