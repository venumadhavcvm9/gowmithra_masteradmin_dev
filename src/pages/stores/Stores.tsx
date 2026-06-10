// src/pages/stores/Stores.tsx

import React, { useEffect, useState } from "react";
import "./stores.css";
import { getStores, type Store } from "./stores.service";
import { toast, Toaster } from "react-hot-toast";
import { FaStore } from "react-icons/fa";

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = () => {
    setIsLoading(true);
    getStores()
      .then((res) => {
        setStores(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load stores.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="stores-page">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="stores-top-bar">
        <div>
          <h1 className="text-gradient">Stores & Inventory</h1>
          <p>Manage veterinary store locations, local inventory, and supply operations.</p>
        </div>
      </div>

      {/* STORES LIST GRID */}
      {isLoading ? (
        <div className="table-loading">Querying Store Database...</div>
      ) : stores.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}
        >
          No stores found.
        </div>
      ) : (
        <div className="table-responsive glass-panel">
          <table className="stores-list-table">
            <thead>
              <tr>
                <th>Shop ID</th>
                <th>Name</th>
                <th>Contact Number</th>
                <th>Username</th>
                <th>Location Details</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>
                    <span className="store-id-badge">{store.shop_id}</span>
                  </td>
                  <td>
                    <strong>{store.name}</strong>
                  </td>
                  <td>{store.contact_number || "N/A"}</td>
                  <td>{store.username || "N/A"}</td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                      State ID: {store.state_id || "N/A"} | District ID: {store.district_id || "N/A"}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                      Mandal ID: {store.mandal_id || "N/A"} | Constituency ID: {store.constituency_id || "N/A"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
