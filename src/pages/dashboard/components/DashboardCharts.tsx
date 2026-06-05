import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function DashboardCharts() {
  const [timeRange, setTimeRange] = useState("Monthly");

  // Mock Sales Data for Recharts
  const salesData = [
    { name: "Jan", sales: 240000 },
    { name: "Feb", sales: 320000 },
    { name: "Mar", sales: 280000 },
    { name: "Apr", sales: 450000 },
    { name: "May", sales: 390000 },
    { name: "Jun", sales: 520000 },
  ];

  // Mock Category Data for Recharts Pie
  const categoryData = [
    { name: "Cattle Supplements", value: 45, color: "#10b981" },
    { name: "Poultry Vaccines", value: 25, color: "#0284c7" },
    { name: "Dewormers", value: 18, color: "#f59e0b" },
    { name: "Antibiotics", value: 12, color: "#f43f5e" },
  ];

  const formatCurrency = (val: number) => {
    return `₹${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="dashboard-charts-row">
      {/* RECHARTS AREA CHART */}
      <div className="chart-card glass-panel">
        <div className="card-header">
          <div>
            <h2>Financial & Sales Performance</h2>
            <p className="card-sub">Overall revenue generated through medical supplies</p>
          </div>
          <div className="toggle-range">
            <button 
              className={timeRange === "Weekly" ? "active" : ""} 
              onClick={() => setTimeRange("Weekly")}
            >
              Weekly
            </button>
            <button 
              className={timeRange === "Monthly" ? "active" : ""} 
              onClick={() => setTimeRange("Monthly")}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="chart-container" style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={salesData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
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
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PIE CHART / SUPPLY DEMAND */}
      <div className="chart-card-secondary glass-panel">
        <div className="card-header">
          <div>
            <h2>Supply Categories</h2>
            <p className="card-sub">Share of order demand by category</p>
          </div>
        </div>

        <div className="pie-chart-wrapper" style={{ width: "100%", height: 230 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "none",
                  borderRadius: "12px",
                  color: "#ffffff"
                }}
                formatter={(value: any) => [`${value}%`, "Market Share"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="pie-legends-grid">
          {categoryData.map((item, idx) => (
            <div className="pie-legend-item" key={idx}>
              <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
              <span className="legend-name">{item.name}</span>
              <span className="legend-val">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
