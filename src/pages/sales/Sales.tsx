// src/pages/sales/Sales.tsx

import "./sales.css";
import { useEffect, useState } from "react";
import { getSales } from "./sales.service";
import {
  FaStore,
  FaWallet,
  FaArrowUp,
  FaFileInvoiceDollar,
  FaPlus
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from "recharts";

export default function Sales() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Backup mock dataset in case the local backend API fails or is offline
  const fallbackSalesData = [
    { shop: "Kolar Veterinary Hub", total: 450000, growth: "+14.2%", status: "Top Performer" },
    { shop: "Tumkur Dairy Supplies", total: 320000, growth: "+8.5%", status: "Stable" },
    { shop: "Mandya Cattle Care", total: 290000, growth: "+12.1%", status: "Top Performer" },
    { shop: "Chittoor Milk Cooperatives", total: 180000, growth: "-3.2%", status: "Needs Support" },
    { shop: "Sangli Livestock Store", total: 150000, growth: "+4.6%", status: "Stable" },
    { shop: "Kolhapur Vet Pharmacy", total: 240000, growth: "+9.8%", status: "Stable" }
  ];

  const weeklyTrend = [
    { name: "Week 1", revenue: 210000, expenses: 140000 },
    { name: "Week 2", revenue: 280000, expenses: 180000 },
    { name: "Week 3", revenue: 350000, expenses: 190000 },
    { name: "Week 4", revenue: 420000, expenses: 220000 },
    { name: "Week 5", revenue: 380000, expenses: 200000 },
  ];

  useEffect(() => {
    setIsLoading(true);
    getSales()
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setData(res.data);
        } else {
          setData(fallbackSalesData);
        }
      })
      .catch((err) => {
        console.warn("Backend API offline, loading realistic mock sales dataset.", err);
        setData(fallbackSalesData);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString()}`;
  };

  const formatK = (val: number) => {
    return `₹${(val / 1000).toFixed(0)}k`;
  };

  const totalSalesVal = data.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

  return (
    <div className="sales-page">
      {/* HEADER SECTION */}
      <div className="sales-top-bar">
        <div>
          <h1 className="text-gradient">Sales & Business Intelligence</h1>
          <p>Analyze regional veterinary hub revenue, inventory supply payouts, and store-wise earnings.</p>
        </div>
        <button className="new-invoice-btn">
          <FaPlus />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* SALES PERFORMANCE METRICS */}
      <div className="sales-metrics">
        <div className="sales-metric-box glass-panel">
          <div className="metric-icon-wrapper blue">
            <FaWallet />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Gross Sales</span>
            <h2>{formatCurrency(totalSalesVal || 1630000)}</h2>
            <span className="growth-indicator positive">
              <FaArrowUp /> +11.4% this month
            </span>
          </div>
        </div>

        <div className="sales-metric-box glass-panel">
          <div className="metric-icon-wrapper green">
            <FaStore />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Veterinary Hubs</span>
            <h2>{data.length} Hubs</h2>
            <span className="growth-indicator positive">
              100% Operational Status
            </span>
          </div>
        </div>

        <div className="sales-metric-box glass-panel">
          <div className="metric-icon-wrapper gold">
            <FaFileInvoiceDollar />
          </div>
          <div className="metric-info">
            <span className="metric-label">Avg Transaction Value</span>
            <h2>₹8,450</h2>
            <span className="growth-indicator positive">
              <FaArrowUp /> +4.2% daily trend
            </span>
          </div>
        </div>
      </div>

      {/* DOUBLE CHARTS SECTION */}
      <div className="sales-charts-grid">
        {/* BAR CHART: REVENUE COMPARISON BY HUB */}
        <div className="sales-chart-card glass-panel">
          <div className="chart-header">
            <h3>Hub-wise Revenue Breakdown</h3>
            <p className="chart-sub">Comparing sales volume across multiple regional hubs</p>
          </div>
          <div className="chart-wrapper" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="shop" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(val) => val.split(" ")[0]} // First word only for clarity
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatK}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#ffffff"
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AREA CHART: WEEKLY CASHFLOW FLOWS */}
        <div className="sales-chart-card glass-panel">
          <div className="chart-header">
            <h3>Weekly Cashflow Analysis</h3>
            <p className="chart-sub">Gross operating revenue vs local logistical expenses</p>
          </div>
          <div className="chart-wrapper" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyTrend}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatK}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#ffffff"
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DETAILED LEDGER TABLE */}
      <div className="ledger-table-section glass-panel">
        <div className="ledger-header">
          <h3>Regional Hub Sales Performance</h3>
          <p className="chart-sub">Breakdown of gross total collections and performance statuses.</p>
        </div>

        {isLoading ? (
          <div className="loading-spinner">Analyzing Ledger Entries...</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Regional Store / Hub</th>
                  <th>Gross Earnings</th>
                  <th>Yield Target Bar</th>
                  <th>Monthly Growth Rate</th>
                  <th>Operational Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  const percentOfTop = (item.total / 450000) * 100;
                  const rankText = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
                  const growthIsPositive = !item.growth || item.growth.startsWith("+");

                  return (
                    <tr key={index}>
                      <td>
                        <strong className="rank-indicator">{rankText}</strong>
                      </td>
                      <td>
                        <div className="store-profile-cell">
                          <FaStore className="store-icon-cell" />
                          <span>{item.shop}</span>
                        </div>
                      </td>
                      <td>
                        <strong className="earnings-amount">{formatCurrency(item.total)}</strong>
                      </td>
                      <td>
                        <div className="target-progress-bar-wrapper">
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${percentOfTop}%`,
                                backgroundColor: percentOfTop > 80 ? "var(--primary)" : percentOfTop > 50 ? "var(--accent-blue)" : "var(--accent-amber)"
                              }}
                            ></div>
                          </div>
                          <span className="percent-label">{percentOfTop.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`growth-pill ${growthIsPositive ? "positive" : "negative"}`}>
                          {item.growth || "+0.0%"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge-custom ${item.status?.toLowerCase().replace(/\s+/g, '') || 'stable'}`}>
                          {item.status || "Stable"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}