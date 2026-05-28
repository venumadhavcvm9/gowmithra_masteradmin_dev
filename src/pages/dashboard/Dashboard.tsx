// src/pages/dashboard/Dashboard.tsx

import "./Dashboard.css";
import {
  FaUsers,
  FaUserMd,
  FaClinicMedical,
  FaCapsules,
  FaArrowUp,
} from "react-icons/fa";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "12,540",
      icon: <FaUsers />,
      growth: "+12%",
    },
    {
      title: "Area Doctors",
      value: "248",
      icon: <FaUserMd />,
      growth: "+8%",
    },
    {
      title: "Vendors",
      value: "86",
      icon: <FaClinicMedical />,
      growth: "+5%",
    },
    {
      title: "Medicines",
      value: "1,240",
      icon: <FaCapsules />,
      growth: "+18%",
    },
  ];

  return (
    <div className="dashboard-page">
      {/* TOP HEADER */}
      <div className="dashboard-top">
        <div>
          <h1>Veterinary Dashboard</h1>
          <p>Welcome back to GowMithra Admin Panel</p>
        </div>

        <button className="export-btn">Export Report</button>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon">{item.icon}</div>

            <div className="stat-content">
              <h3>{item.title}</h3>
              <h2>{item.value}</h2>

              <div className="growth">
                <FaArrowUp />
                <span>{item.growth} this month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHART + TABLE */}
      <div className="dashboard-row">
        {/* SALES CHART */}
        <div className="chart-card">
          <div className="card-header">
            <h2>Sales Overview</h2>
            <select>
              <option>Monthly</option>
              <option>Weekly</option>
            </select>
          </div>

          <div className="fake-chart">
            <div className="bar bar1"></div>
            <div className="bar bar2"></div>
            <div className="bar bar3"></div>
            <div className="bar bar4"></div>
            <div className="bar bar5"></div>
            <div className="bar bar6"></div>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="table-card">
          <div className="card-header">
            <h2>Recent Orders</h2>
          </div>

          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>#ORD001</td>
                <td>Ramesh</td>
                <td>
                  <span className="status delivered">Delivered</span>
                </td>
                <td>₹2,450</td>
              </tr>

              <tr>
                <td>#ORD002</td>
                <td>Suresh</td>
                <td>
                  <span className="status pending">Pending</span>
                </td>
                <td>₹1,250</td>
              </tr>

              <tr>
                <td>#ORD003</td>
                <td>Mahesh</td>
                <td>
                  <span className="status cancelled">Cancelled</span>
                </td>
                <td>₹980</td>
              </tr>

              <tr>
                <td>#ORD004</td>
                <td>Kiran</td>
                <td>
                  <span className="status delivered">Delivered</span>
                </td>
                <td>₹3,850</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM CARDS */}
      <div className="bottom-grid">
        <div className="bottom-card">
          <h2>Top Selling Medicines</h2>

          <ul>
            <li>Vitamin Syrup</li>
            <li>Deworming Powder</li>
            <li>Feed Booster</li>
            <li>Calcium Tonic</li>
          </ul>
        </div>

        <div className="bottom-card">
          <h2>Top Area Doctors</h2>

          <ul>
            <li>Dr. Ramesh</li>
            <li>Dr. Karthik</li>
            <li>Dr. Suresh</li>
            <li>Dr. Mahesh</li>
          </ul>
        </div>

        <div className="bottom-card">
          <h2>Notifications</h2>

          <ul>
            <li>15 New Orders Received</li>
            <li>New Vendor Registration</li>
            <li>Medicine Stock Low</li>
            <li>Doctor Commission Updated</li>
          </ul>
        </div>
      </div>
    </div>
  );
}