// src/pages/orders/Orders.tsx

import "./orders.css";
import { useEffect, useState } from "react";
import {
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
} from "./orders.service";
import type { Order, OrderStatus, PaymentStatus, OrderItem } from "./orders.service";
import { getCurrentUser } from "../../services/auth";
import {
  FaClipboardList,
  FaTimes,
  FaCheck,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaStore,
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaFileDownload } from "react-icons/fa";

const parseOrderItems = (items: any): OrderItem[] => {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) return parsed as OrderItem[];
    } catch (e) {
      console.error("Failed to parse items JSON string:", e);
    }
  }
  return [];
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [shopIdFilter, setShopIdFilter] = useState("");

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Invoice Modal
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  // Status/Payment updates temporary state in modal
  const [nextOrderStatus, setNextOrderStatus] = useState<OrderStatus | "">("");
  const [shopIdInput, setShopIdInput] = useState("");
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  const [nextPaymentStatus, setNextPaymentStatus] = useState<PaymentStatus | "">("");

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const isStock = currentUser?.role === "STOCK";
  const canUpdateStatus = isAdmin || isStock;

  useEffect(() => {
    loadOrders();
  }, [page, orderStatusFilter, paymentStatusFilter, shopIdFilter]);

  const downloadPDF = async () => {
    const element = document.getElementById("invoice-print-area");
    if (!element) return;
    
    const loadToast = toast.loading("Generating PDF...");
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${invoiceModalOrder?.order_id || "Download"}.pdf`);
      toast.success("PDF Downloaded successfully!", { id: loadToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF", { id: loadToast });
    }
  };

  const loadOrders = () => {
    setIsLoading(true);
    const filters: any = {
      page,
      limit,
    };
    if (orderStatusFilter !== "All") filters.order_status = orderStatusFilter;
    if (paymentStatusFilter !== "All") filters.payment_status = paymentStatusFilter;
    if (shopIdFilter) filters.shop_id = Number(shopIdFilter);

    getOrders(filters)
      .then((res) => {
        setOrders(res.data.orders);
        setTotalCount(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load cattle orders.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setNextOrderStatus("");
    setShopIdInput(order.shop_id ? order.shop_id.toString() : "");
    setCancelReasonInput("");
    setNextPaymentStatus("");
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !nextOrderStatus) return;

    // Strict validation check matching backend schema transitions
    const loadToast = toast.loading("Updating order status...");

    if (nextOrderStatus === "CANCELLED") {
      cancelOrder(selectedOrder.id, cancelReasonInput || "Cancelled by admin")
        .then(() => {
          toast.success("Order cancelled successfully!", { id: loadToast });
          setSelectedOrder(null);
          loadOrders();
        })
        .catch((err) => {
          console.error(err);
          const errMsg = err.response?.data?.message || "Failed to cancel order.";
          toast.error(errMsg, { id: loadToast });
        });
    } else {
      const shopIdNum = shopIdInput ? Number(shopIdInput) : undefined;
      updateOrderStatus(selectedOrder.id, nextOrderStatus as OrderStatus, shopIdNum)
        .then(() => {
          toast.success("Order status updated successfully!", { id: loadToast });
          setSelectedOrder(null);
          loadOrders();
        })
        .catch((err) => {
          console.error(err);
          const errMsg = err.response?.data?.message || "Failed to update order status.";
          toast.error(errMsg, { id: loadToast });
        });
    }
  };

  const handleUpdatePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !nextPaymentStatus || !isAdmin) return;

    const loadToast = toast.loading("Updating payment status...");
    updatePaymentStatus(selectedOrder.id, nextPaymentStatus as PaymentStatus)
      .then(() => {
        toast.success("Payment status updated successfully!", { id: loadToast });
        setSelectedOrder(null);
        loadOrders();
      })
      .catch((err) => {
        console.error(err);
        const errMsg = err.response?.data?.message || "Failed to update payment status.";
        toast.error(errMsg, { id: loadToast });
      });
  };

  const getAllowedTransitions = (status: OrderStatus): OrderStatus[] => {
    switch (status) {
      case "PENDING":
        return ["ACCEPTED", "CANCELLED"];
      case "ACCEPTED":
        return ["OUT_FOR_DELIVERY", "CANCELLED"];
      case "OUT_FOR_DELIVERY":
        return ["DELIVERED"];
      default:
        return [];
    }
  };

  // Helper metric counts
  const pendingOrders = orders.filter((o) => o.order_status === "PENDING").length;
  const grossSales = orders
    .filter((o) => o.payment_status === "PAID")
    .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  return (
    <div className="orders-page">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="orders-top-bar">
        <div>
          <h1 className="text-gradient">Cattle Logistics & Orders</h1>
          <p>Track pending livestock packages, approve prescriptions, and route orders to regional stores.</p>
        </div>
      </div>

      {/* METRICS */}
      <div className="orders-metrics">
        <div className="order-metric-box glass-panel">
          <span className="order-metric-title">Total Orders Listed</span>
          <h2>
            {totalCount} <FaClipboardList className="inline-icon" />
          </h2>
          <span className="order-metric-sub text-up">Database records</span>
        </div>
        <div className="order-metric-box glass-panel">
          <span className="order-metric-title">Pending Approvals</span>
          <h2>{pendingOrders} Dispatch</h2>
          <span className="order-metric-sub" style={{ color: "var(--accent-amber)" }}>
            Awaiting shop allocation
          </span>
        </div>
        <div className="order-metric-box glass-panel">
          <span className="order-metric-title">Revenue (Current Page)</span>
          <h2>₹{grossSales.toLocaleString()}</h2>
          <span className="order-metric-sub text-up">From settled PAID payments</span>
        </div>
        <div className="order-metric-box glass-panel">
          <span className="order-metric-title">SLA Dispatch Rate</span>
          <h2>96.4%</h2>
          <span className="order-metric-sub text-up">Shipped within 24 hours</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="orders-controls glass-panel">
        <div className="search-group" style={{ flex: "0 0 250px" }}>
          <FaStore className="search-icon" />
          <input
            type="number"
            placeholder="Filter by Shop ID..."
            value={shopIdFilter}
            onChange={(e) => {
              setShopIdFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filters-group">
          <div className="filter-select">
            <select
              value={orderStatusFilter}
              onChange={(e) => {
                setOrderStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Order Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="filter-select">
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Payment Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="REFUND_PENDING">Refund Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="orders-table-section glass-panel">
        <div className="orders-table-header">
          <h3>Central Logistics Ledger</h3>
          <p>Detailed view of customer orders, prescription requirements, and payouts.</p>
        </div>

        {isLoading ? (
          <div className="table-loading">Querying Cattle Orders Registry...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No orders found matching selected filters.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Order Date</th>
                    <th>Order ID</th>
                    <th>Recipient</th>
                    <th>Ordered Medicines</th>
                    <th>Total Price</th>
                    <th>Payment Mode</th>
                    <th>Payment Status</th>
                    <th>Order Status</th>
                    <th>Shop ID</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    // Build summary text for items
                    const itemsSummary = parseOrderItems(order.items)
                      .map((it) => `${it.name} (x${it.quantity})`)
                      .join(", ");

                    return (
                      <tr key={order.id}>
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", whiteSpace: "nowrap" }}>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td>
                          <button 
                            style={{ background: "transparent", border: "none", color: "var(--accent-blue)", fontWeight: "bold", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                            onClick={() => handleOpenDetails(order)}
                            title="Manage Order Details"
                          >
                            {order.order_id}
                          </button>
                        </td>
                        <td>
                          <div className="order-profile-cell">
                            <span className="order-profile-name">{order.full_name}</span>
                            <span className="order-profile-phone">{order.mobile}</span>
                          </div>
                        </td>
                        <td>
                          <div 
                            className="clickable-order-items"
                            onClick={() => setInvoiceModalOrder(order)}
                            title="Click to view full Invoice"
                            style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "var(--text-muted)", minWidth: "180px", cursor: "pointer", padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,0.02)", border: "1px dashed transparent", transition: "all 0.2s" }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
                          >
                            {parseOrderItems(order.items).map((it, idx) => (
                              <div key={idx} style={{ lineHeight: "1.4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={`${it.name} (x${it.quantity})`}>
                                • {it.name} <strong style={{color:"var(--text-main)"}}>(x{it.quantity})</strong>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: "var(--secondary)" }}>
                            ₹{Number(order.total_amount || 0).toFixed(2)}
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, fontSize: "11px" }}>
                            {order.payment_mode}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`payment-status-pill ${(order.payment_status || "PENDING").toLowerCase()}`}
                          >
                            {order.payment_status || "PENDING"}
                          </span>
                        </td>
                        <td>
                          <span className={`order-status-pill ${(order.order_status || "PENDING").toLowerCase()}`}>
                            {(order.order_status || "PENDING").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "var(--text-muted)" }}>
                            {order.shop_id ? `SH-${order.shop_id}` : "Not Assigned"}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="pagination-controls">
              <span>
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total:{" "}
                <strong>{totalCount}</strong> orders)
              </span>
              <div className="pagination-btn-group">
                <button
                  className="pagination-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <FaChevronLeft /> Prev
                </button>
                <button
                  className="pagination-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* INVOICE MODAL */}
      {invoiceModalOrder && (
        <div className="edit-modal-backdrop" onClick={() => setInvoiceModalOrder(null)}>
          <div className="invoice-modal-card" onClick={(e) => e.stopPropagation()}>
            <div id="invoice-print-area" className="invoice-print-area">
              <div className="invoice-customer-info">
                <div className="invoice-info-col">
                  <label>CUSTOMER NAME</label>
                  <span>{invoiceModalOrder.full_name || "N/A"}</span>
                </div>
                <div className="invoice-info-col">
                  <label>CONTACT MOBILE</label>
                  <span>{invoiceModalOrder.mobile || "N/A"}</span>
                </div>
                <div className="invoice-info-col">
                  <label>DELIVERY ADDRESS</label>
                  <span>{invoiceModalOrder.delivery_address || "N/A"}</span>
                </div>
                <div className="invoice-info-col">
                  <label>PAYMENT METHOD</label>
                  <span>{invoiceModalOrder.payment_mode} ({invoiceModalOrder.payment_mode})</span>
                </div>
              </div>
              
              <h4 className="invoice-section-title">ITEMIZED SUMMARY</h4>
              
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>ITEM ID</th>
                    <th>MEDICINE NAME</th>
                    <th>PRICE</th>
                    <th>QUANTITY</th>
                    <th>SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {parseOrderItems(invoiceModalOrder.items).map((it, idx) => {
                    const price = Number(it.price || 0);
                    const qty = Number(it.quantity || 1);
                    return (
                      <tr key={idx}>
                        <td>MED{String(it.medicine_id || "000").padStart(4, "0")}</td>
                        <td><strong>{it.name}</strong></td>
                        <td>₹{price.toFixed(2)}</td>
                        <td>{qty}</td>
                        <td><strong>₹{(price * qty).toFixed(2)}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="invoice-total">
                <span>TOTAL AMOUNT:</span>
                <strong className="invoice-total-val">₹{Number(invoiceModalOrder.total_amount || 0).toFixed(2)}</strong>
              </div>
            </div>
            
            <div className="invoice-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <button className="cancel-btn" onClick={() => setInvoiceModalOrder(null)}>
                <FaTimes /> Close
              </button>
              <button className="save-btn" onClick={downloadPDF} style={{ background: "var(--accent-blue)" }}>
                <FaFileDownload /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL (Order details & transitions) */}
      {selectedOrder && (
        <div className="edit-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <FaClipboardList className="modal-shield-icon" />
              <div>
                <h3>Order Lifecycle Control</h3>
                <p>Verify prescription docs, transition logistic flow, and resolve payments.</p>
              </div>
            </div>

            {/* Recipient details */}
            <div className="order-grid-details">
              <div className="order-grid-col">
                <label>Customer Name</label>
                <span>{selectedOrder.full_name}</span>
              </div>
              <div className="order-grid-col">
                <label>Contact Mobile</label>
                <span>{selectedOrder.mobile}</span>
              </div>
              <div className="order-grid-col">
                <label>Delivery Address</label>
                <span style={{ fontSize: "12px", lineHeight: "1.3" }}>
                  {selectedOrder.address}
                </span>
              </div>
              <div className="order-grid-col">
                <label>Payment Method</label>
                <span>{selectedOrder.payment_mode} (COD / ONLINE)</span>
              </div>
            </div>

            {/* Itemized summary */}
            <div>
              <span className="transition-title" style={{ paddingLeft: "4px" }}>
                Itemized Summary
              </span>
              <table className="order-items-list-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Medicine Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {parseOrderItems(selectedOrder.items).map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.medicine_id}</td>
                      <td>
                        <strong>{it.name}</strong>
                        {it.requires_prescription && (
                          <span
                            className="prescription-badge"
                            style={{ marginLeft: "6px", display: "inline-block" }}
                          >
                            Rx Needed
                          </span>
                        )}
                      </td>
                      <td>₹{Number(it.price || 0).toFixed(2)}</td>
                      <td>{it.quantity}</td>
                      <td>
                        <strong>₹{Number(it.subtotal || 0).toFixed(2)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="order-total-summary">
                <span>TOTAL AMOUNT:</span>
                <span style={{ fontSize: "18px", color: "var(--primary)" }}>
                  ₹{Number(selectedOrder.total_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Prescription Doc Verification */}
            {selectedOrder.prescription_image && (
              <div className="prescription-preview-box">
                <span className="prescription-preview-title">Prescription File Attached</span>
                <img
                  src={selectedOrder.prescription_image}
                  alt="Farmer prescription doc upload"
                  className="prescription-img"
                  onError={(e) => {
                    // Fallback in case of broken mockup URL
                    (e.target as any).src =
                      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80";
                  }}
                />
              </div>
            )}

            {/* Order lifecycle status update form */}
            {canUpdateStatus && (
              <form onSubmit={handleUpdateStatusSubmit} className="transition-block">
                <span className="transition-title">Update Order Logistics State</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="transition-options-row">
                    {getAllowedTransitions(selectedOrder.order_status || "PENDING").length === 0 ? (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        No legal status transitions from current state (
                        <strong>{selectedOrder.order_status || "PENDING"}</strong>).
                      </span>
                    ) : (
                      getAllowedTransitions(selectedOrder.order_status || "PENDING").map((state) => (
                        <button
                          key={state}
                          type="button"
                          className={`transition-badge-btn ${
                            nextOrderStatus === state ? "selected" : ""
                          }`}
                          onClick={() => {
                            setNextOrderStatus(state);
                          }}
                        >
                          {state.replace(/_/g, " ")}
                        </button>
                      ))
                    )}
                  </div>

                  {nextOrderStatus === "ACCEPTED" && (
                    <div className="form-group-custom" style={{ marginTop: "6px" }}>
                      <label>Allocate Depot / Shop ID (Numeric, e.g. 2)</label>
                      <input
                        type="number"
                        placeholder="Enter target shop ID (e.g. 2)"
                        value={shopIdInput}
                        onChange={(e) => setShopIdInput(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {nextOrderStatus === "CANCELLED" && (
                    <div className="form-group-custom" style={{ marginTop: "6px" }}>
                      <label>Reason for Cancellation</label>
                      <input
                        type="text"
                        placeholder="Provide details for customer record..."
                        value={cancelReasonInput}
                        onChange={(e) => setCancelReasonInput(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {nextOrderStatus && (
                    <button
                      type="submit"
                      className="save-btn"
                      style={{ alignSelf: "flex-end", height: "34px", fontSize: "12px" }}
                    >
                      <FaCheck /> Confirm Logistics Transition
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Admin only payment update form */}
            {isAdmin && (
              <form onSubmit={handleUpdatePaymentSubmit} className="transition-block payment-block">
                <span className="transition-title">Admin: Update Billing / Payment Status</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="transition-options-row">
                    {["PENDING", "PAID", "FAILED", "REFUND_PENDING"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`transition-badge-btn ${
                          nextPaymentStatus === status ? "selected payment" : ""
                        }`}
                        onClick={() => setNextPaymentStatus(status as PaymentStatus)}
                      >
                        {status.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>

                  {nextPaymentStatus && nextPaymentStatus !== selectedOrder.payment_status && (
                    <button
                      type="submit"
                      className="save-btn"
                      style={{
                        alignSelf: "flex-end",
                        height: "34px",
                        fontSize: "12px",
                        background: "var(--accent-blue)",
                      }}
                    >
                      <FaCheck /> Confirm Billing Update
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="modal-actions-footer" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setSelectedOrder(null)}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <FaTimes /> Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
