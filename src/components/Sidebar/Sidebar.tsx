// src/components/Sidebar/Sidebar.tsx

import "./sidebar.css";
import {
  FaHome,
  FaUsers,
  FaUserMd,
  FaChartLine,
  FaCapsules,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
  FaClinicMedical,
} from "react-icons/fa";

import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const menus = [
    {
      name: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard",
    },
    {
      name: "Sales",
      icon: <FaChartLine />,
      path: "/sales",
    },
    {
      name: "Users",
      icon: <FaUsers />,
      path: "/users",
    },
    {
      name: "Area Doctors",
      icon: <FaUserMd />,
      path: "/area-doctors",
    },
    {
      name: "Medicines",
      icon: <FaCapsules />,
      path: "/medicines",
    },
    {
      name: "Orders",
      icon: <FaClipboardList />,
      path: "/orders",
    },
    {
      name: "Vendors",
      icon: <FaClinicMedical />,
      path: "/vendors",
    },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* TOP */}
      <div className="sidebar-top">
        {!collapsed && (
          <div className="brand">
            <div className="brand-logo">🐄</div>

            <div>
              <h2>GowMithra</h2>
              <p>Veterinary ERP</p>
            </div>
          </div>
        )}

        <button
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* MENU */}
      <div className="sidebar-menu">
        {menus.map((menu, index) => (
          <NavLink
            key={index}
            to={menu.path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="menu-icon">{menu.icon}</span>

            {!collapsed && (
              <span className="menu-text">{menu.name}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        {!collapsed && (
          <>
            <div className="support-card">
              <h4>Need Help?</h4>
              <p>Veterinary support available 24/7</p>

              <button>Contact Support</button>
            </div>

            <div className="version">
              Version 1.0.0
            </div>
          </>
        )}
      </div>
    </div>
  );
}