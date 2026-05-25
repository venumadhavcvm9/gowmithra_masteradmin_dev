import "./sidebar.css";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>GowMithra</h2>

      <Link to="/dashboard">Dashboard</Link>
      <Link to="/sales">Sales</Link>
      <Link to="/users">Users</Link>
      <Link to="/area-doctors">Area Doctors</Link>
    </div>
  );
}