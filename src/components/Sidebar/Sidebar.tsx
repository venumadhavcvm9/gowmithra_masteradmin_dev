// src/components/Sidebar/Sidebar.tsx

import "./sidebar.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { hasAccess } from "../../services/auth";
import { menus } from "./sidebarConfig";
import BrandHeader from "./components/BrandHeader";
// import SupportCard from "./components/SupportCard";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* BRAND & TOGGLE */}
      <BrandHeader collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* MENU */}
      <div className="sidebar-menu">
        {menus.filter((menu) => hasAccess(menu.path)).map((menu, index) => (
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

            {collapsed && (
              <div className="tooltip">{menu.name}</div>
            )}
          </NavLink>
        ))}
      </div>

      {/* SUPPORT & VERSION */}
      {/* <SupportCard collapsed={collapsed} /> */}
    </div>
  );
}