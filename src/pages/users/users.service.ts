import API from "../../services/api";

export interface User {
  id: number;
  full_name: string;
  mobile: string;
  state_id: number;
  district_id: number;
  mandal_id: number;
  constituency_id: number;
  village_id: number;
  address: string;
  is_mobile_verified: boolean;
  status: string;
}

// 🔹 Get All Users (Farmers): GET /api/admin/users
export const getUsers = async (): Promise<{ data: User[] }> => {
  const res = await API.get("/admin/users");
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return { data: res.data.data };
  }
  throw new Error("Invalid API format received");
};
