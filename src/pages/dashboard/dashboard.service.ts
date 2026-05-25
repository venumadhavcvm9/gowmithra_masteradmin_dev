import API from "../../services/api";

// Example APIs (you can connect real backend later)
export const getDashboardCounts = async () => {
  // replace with your backend API
  // return API.get("/dashboard");

  return {
    vendors: 25,
    doctors: 40,
    users: 1200,
    sales: "₹2.4L"
  };
};

export const getDashboardData = async () => {
  const res = await API.get("/dashboard");
  return res.data;
};
export const getSalesData = async () => {
  return [
    { month: "Jan", sales: 400 },
    { month: "Feb", sales: 800 }
  ];
};