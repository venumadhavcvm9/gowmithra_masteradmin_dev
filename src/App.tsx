import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import AdminLayout from "./layouts/AdminLayout";


export default function App() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}