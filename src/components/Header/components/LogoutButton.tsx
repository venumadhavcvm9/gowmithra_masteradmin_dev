import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../services/auth";
import API from "../../../services/api";

export default function LogoutButton() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // 🔹 Call backend logout API to invalidate session
    API.post("/auth/logout")
      .catch((err) => {
        console.warn("Backend logout endpoint failed or server offline:", err);
      })
      .finally(() => {
        // Clear local storage and redirect regardless of backend connection state
        logoutUser();
        navigate("/login");
      });
  };

  return (
    <button className="logout-action-btn" onClick={handleLogout}>
      <FiLogOut />
      <span>Logout</span>
    </button>
  );
}
