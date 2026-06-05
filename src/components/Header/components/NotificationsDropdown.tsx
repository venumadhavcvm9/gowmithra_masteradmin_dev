import { useState, useEffect, useRef } from "react";
import { FiBell, FiAlertTriangle, FiCheckCircle, FiShoppingBag } from "react-icons/fi";

export default function NotificationsDropdown() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      title: "15 New Orders Received",
      desc: "Pending approval in regional veterinary hubs.",
      time: "2 mins ago",
      icon: <FiShoppingBag className="icon-order" />,
      unread: true,
    },
    {
      id: 2,
      type: "alert",
      title: "Stock Alert: Deworming Powder",
      desc: "Inventory levels are below 10% in Hub B.",
      time: "1 hour ago",
      icon: <FiAlertTriangle className="icon-alert" />,
      unread: true,
    },
    {
      id: 3,
      type: "system",
      title: "New Vendor Verified",
      desc: "Apex Veterinary Labs has been fully onboarded.",
      time: "4 hours ago",
      icon: <FiCheckCircle className="icon-system" />,
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, unread: false }))
    );
  };

  return (
    <div className="notifications-wrapper" ref={dropdownRef}>
      <button 
        className={`notification-btn ${notificationsOpen ? 'active' : ''}`}
        onClick={() => setNotificationsOpen(!notificationsOpen)}
        aria-label="View notifications"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notification-badge-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {notificationsOpen && (
        <div className="notifications-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-read-btn">
                Mark all read
              </button>
            )}
          </div>
          <div className="dropdown-list">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`dropdown-item ${n.unread ? "unread" : ""}`}
              >
                <div className="item-icon-wrapper">
                  {n.icon}
                </div>
                <div className="item-content">
                  <div className="item-title">{n.title}</div>
                  <div className="item-desc">{n.desc}</div>
                  <span className="item-time">{n.time}</span>
                </div>
                {n.unread && <span className="unread-dot"></span>}
              </div>
            ))}
          </div>
          <div className="dropdown-footer">
            <button>View All Notifications</button>
          </div>
        </div>
      )}
    </div>
  );
}
