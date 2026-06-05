import API from "../../services/api";

// 🔹 Get Admin Dashboard Stats: GET /api/admin/dashboard/stats
export const getAdminDashboardStats = async () => {
  const res = await API.get("/admin/dashboard/stats");
  return res.data;
};

// 🔹 Get Public Dashboard Stats: GET /api/dashboard
export const getPublicDashboardStats = async () => {
  const res = await API.get("/dashboard");
  return res.data;
};

// 🔹 Get All Area Doctors: GET /api/admin/area-doctors
export const getDashboardDoctors = async () => {
  const res = await API.get("/admin/area-doctors");
  return res.data;
};

// 🔹 Get All Users/Farmers: GET /api/admin/users
export const getDashboardUsers = async () => {
  const res = await API.get("/admin/users");
  return res.data;
};