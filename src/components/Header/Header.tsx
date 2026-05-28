// src/components/Header/Header.tsx

import "./Header.css";
import {
  FiSearch,
  FiBell,
  FiLogOut,
} from "react-icons/fi";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="search-box">
          <FiSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search medicines, doctors, vendors..."
          />
        </div>
      </div>

      <div className="header-right">
        <button className="notification-btn">
          <FiBell />
          <span className="notification-dot"></span>
        </button>
        <button className="logout-btn">
          <FiLogOut />
          Logout
        </button>
      </div>
    </header>
  );
}