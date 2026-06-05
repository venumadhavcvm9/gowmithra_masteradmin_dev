import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface BrandHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function BrandHeader({ collapsed, setCollapsed }: BrandHeaderProps) {
  return (
    <div className="sidebar-top">
      {!collapsed && (
        <div className="brand">
          <div className="brand-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="3" width="6" height="18" rx="2" fill="white" />
              <rect x="3" y="9" width="18" height="6" rx="2" fill="white" />
              <path d="M12 5C13.5 7.5 15.5 8.5 18 8.5C15.5 9.5 13.5 10.5 12 13C10.5 10.5 8.5 9.5 6 8.5C8.5 8.5 10.5 7.5 12 5Z" fill="#10b981" />
            </svg>
          </div>

          <div className="brand-text">
            <h2>GowMithra</h2>
            <p>Veterinary ERP</p>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="brand-logo-collapsed">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="3" width="6" height="18" rx="2" fill="white" />
            <rect x="3" y="9" width="18" height="6" rx="2" fill="white" />
            <path d="M12 5C13.5 7.5 15.5 8.5 18 8.5C15.5 9.5 13.5 10.5 12 13C10.5 10.5 8.5 9.5 6 8.5C8.5 8.5 10.5 7.5 12 5Z" fill="#10b981" />
          </svg>
        </div>
      )}

      <button
        className="toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle Sidebar"
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>
    </div>
  );
}
