import { FiChevronDown } from "react-icons/fi";
import { getCurrentUser } from "../../../services/auth";

export default function UserProfile() {
  const user = getCurrentUser();
  
  const displayName = user ? user.name : "Dr. Rajesh Kumar";
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ADMIN": return "Master Admin";
      case "STOCK": return "Stock Manager";
      case "SALES": return "Sales Officer";
      case "MARKETING": return "Marketing Recruiter";
      default: return "Master Admin";
    }
  };
  const displayRole = getRoleLabel(user?.role);

  return (
    <div className="user-profile-section">
      <img
        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
        alt={displayName}
        className="avatar-img"
      />
      <div className="profile-info-block">
        <h4>{displayName}</h4>
        <span className="role-badge">{displayRole}</span>
      </div>
      <FiChevronDown className="chevron-down" />
    </div>
  );
}
