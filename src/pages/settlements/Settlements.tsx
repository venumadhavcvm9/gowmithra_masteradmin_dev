import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast, Toaster } from "react-hot-toast";
import { FaMoneyBillWave, FaCheck, FaTimes, FaEye } from "react-icons/fa";

interface Settlement {
  id: string;
  saleTitle: string;
  amount: number;
  receiptUrl: string;
  reason: string;
  status: string;
  timestamp: string;
}

export default function Settlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/pharmacy/settlements");
      setSettlements(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settlements.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const loadToast = toast.loading(`Updating status to ${status}...`);
    try {
      await API.put(`/pharmacy/settlements/${id}/status`, { status });
      toast.success(`Settlement ${status}!`, { id: loadToast });
      loadSettlements();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.", { id: loadToast });
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <Toaster position="top-right" />
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
          <FaMoneyBillWave style={{ color: "#10b981" }} /> Pharmacy Cash Settlements
        </h1>
        <p style={{ color: "#64748b", marginTop: "5px" }}>Review and approve end-of-day cash drops from pharmacy terminals.</p>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading settlements...</div>
        ) : settlements.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No cash settlements found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: "14px", textTransform: "uppercase" }}>
                <th style={{ padding: "12px" }}>Time & ID</th>
                <th style={{ padding: "12px" }}>Amount</th>
                <th style={{ padding: "12px" }}>Reason</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Receipt</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 12px" }}>
                    <div style={{ fontWeight: "bold", color: "#334155" }}>{s.timestamp}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{s.id}</div>
                  </td>
                  <td style={{ padding: "16px 12px", fontWeight: "bold", color: "#10b981" }}>
                    ₹{Number(s.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: "16px 12px", color: "#475569", fontSize: "14px" }}>
                    {s.reason}
                  </td>
                  <td style={{ padding: "16px 12px" }}>
                    <span style={{ 
                      padding: "4px 10px", 
                      borderRadius: "20px", 
                      fontSize: "12px", 
                      fontWeight: "bold",
                      backgroundColor: s.status === 'Approved' ? '#d1fae5' : s.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                      color: s.status === 'Approved' ? '#065f46' : s.status === 'Rejected' ? '#991b1b' : '#92400e'
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 12px", textAlign: "center" }}>
                    <button 
                      onClick={() => setSelectedReceiptUrl(s.receiptUrl)}
                      style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px", color: "#475569", fontSize: "13px" }}
                    >
                      <FaEye /> View
                    </button>
                  </td>
                  <td style={{ padding: "16px 12px", textAlign: "right" }}>
                    {s.status === 'Pending' ? (
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button 
                          onClick={() => updateStatus(s.id, "Approved")}
                          style={{ background: "#10b981", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold", fontSize: "13px" }}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button 
                          onClick={() => updateStatus(s.id, "Rejected")}
                          style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold", fontSize: "13px" }}
                        >
                          <FaTimes /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "13px", fontStyle: "italic" }}>Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lightbox */}
      {selectedReceiptUrl && (
        <div 
          onClick={() => setSelectedReceiptUrl(null)}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", padding: "20px", borderRadius: "12px", maxWidth: "600px", width: "90%" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Deposit Receipt</h3>
              <button 
                onClick={() => setSelectedReceiptUrl(null)}
                style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}
              >
                <FaTimes />
              </button>
            </div>
            <img src={selectedReceiptUrl} alt="Receipt" style={{ width: "100%", borderRadius: "8px", maxHeight: "70vh", objectFit: "contain" }} />
          </div>
        </div>
      )}
    </div>
  );
}
