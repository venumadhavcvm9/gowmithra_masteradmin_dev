interface Farmer {
  id: number;
  full_name: string;
  mobile: string;
  is_mobile_verified: boolean;
  status: string;
  address?: string;
}

interface RecentFarmersTableProps {
  farmers: Farmer[];
}

export default function RecentFarmersTable({ farmers }: RecentFarmersTableProps) {
  return (
    <div className="table-row-section glass-panel">
      <div className="table-header-block">
        <div>
          <h2>Recently Onboarded Farmers</h2>
          <p className="card-sub">Live feed of active agricultural and dairy farmers registered on the platform.</p>
        </div>
      </div>

      <div className="table-responsive">
        {farmers.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
            No farmers registered yet in the system.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>System ID</th>
                <th>Farmer Name</th>
                <th>Mobile Contact</th>
                <th>Mobile Verified</th>
                <th>Location Address</th>
                <th>Animal</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((farmer, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="order-id-label">FM00{farmer.id}</span>
                  </td>
                  <td>
                    <strong>{farmer.full_name}</strong>
                  </td>
                  <td>
                    <span className="medicine-tag">{farmer.mobile}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${farmer.is_mobile_verified ? "delivered" : "pending"}`}>
                      <span className="status-dot"></span>
                      {farmer.is_mobile_verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <span className="date-label">{farmer.address || "N/A"}</span>
                  </td>
                  <td>
                    <span className="status-pill delivered">
                      <span className="status-dot" style={{ backgroundColor: "var(--accent-amber)" }}></span>
                      {farmer.id % 2 === 0 ? "Cow (Gir)" : "Buffalo (Murrah)"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
