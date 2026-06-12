// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Sales from "./pages/sales/Sales";
import Users from "./pages/users/Users";
import AreaDoctor from "./pages/areaDoctor/AreaDoctor";
import Team from "./pages/team/Team";
import Login from "./pages/login/Login";
import Medicines from "./pages/medicines/Medicines";
import Orders from "./pages/orders/Orders";
import Settlements from "./pages/settlements/Settlements";
import Stores from "./pages/stores/Stores";
import Inventory from "./pages/inventory/Inventory";
import AdminLayout from "./layouts/AdminLayout";
import { isAuthenticated, hasAccess, logoutUser, getPrimaryLandingPath, getCurrentUser } from "./services/auth";
import { FaClinicMedical, FaExclamationTriangle, FaSignOutAlt, FaStore } from "react-icons/fa";
import "./App.css";

// ─── Placeholder (unimplemented pages) ───────────────────────────

function OperationalPlaceholder({ title, icon, subtitle }: {
  title: string;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="info-screen">
      <div className="info-screen__icon">{icon}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button className="info-screen__btn" onClick={() => window.history.back()}>
        Go Back
      </button>
    </div>
  );
}

// ─── Access Denied ────────────────────────────────────────────────

function AccessDenied() {
  const user = getCurrentUser();
  const primaryPath = user ? getPrimaryLandingPath(user.role) : "/login";

  const handleSignOut = () => {
    logoutUser();
    window.location.href = "/login";
  };

  return (
    <div className="info-screen">
      <div className="info-screen__icon info-screen__icon--danger">
        <FaExclamationTriangle />
      </div>
      <h1>Access Denied</h1>
      <p>
        Your account (<strong>{user?.name}</strong>, Role: <strong>{user?.role}</strong>) is
        not authorized to view this page.
      </p>
      <div className="info-screen__actions">
        <button className="info-screen__btn" onClick={() => window.location.href = primaryPath}>
          Return to My Dashboard
        </button>
        <button className="info-screen__btn info-screen__btn--outline" onClick={handleSignOut}>
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Route Guard ──────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasAccess(location.pathname)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

// ─── App ──────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/area-doctors" element={<AreaDoctor />} />

                  {/* Dynamic catalog and order modules */}
                  <Route path="/medicines" element={<Medicines />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/pharmacy-settlements" element={<Settlements />} />
                  <Route path="/stores" element={<Stores />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/vendors" element={
                    <OperationalPlaceholder
                      icon={<FaClinicMedical />}
                      title="Labs & Clinic Vendors"
                      subtitle="Manage medical licensing, commission accounts, and dispatch agreements for veterinary labs."
                    />
                  } />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}