// src/pages/stores/stores.service.ts

import API from "../../services/api";

export interface Store {
  id: number;
  shop_id: string;
  name: string;
  contact_number: string;
  username: string;
  state_id?: number;
  district_id?: number;
  mandal_id?: number;
  constituency_id?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 🔹 Get All Stores: GET /api/shops
export const getStores = async (): Promise<{ data: Store[] }> => {
  const res = await API.get("/shops");
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return { data: res.data.data };
  } else if (res.data && Array.isArray(res.data)) {
    return { data: res.data };
  }
  throw new Error("Invalid API format received");
};
