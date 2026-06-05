// src/pages/medicines/medicines.service.ts

import API from "../../services/api";

export type MedicineType =
  | "ANTIBIOTIC"
  | "INJECTABLE"
  | "HORMONAL"
  | "STRONG_ANTIPARASITIC"
  | "VACCINE"
  | "DEWORMER"
  | "ECTOPARASITE"
  | "SUPPLEMENT"
  | "TOPICAL"
  | "FEED_ADDITIVE";

export interface Medicine {
  id: number;
  medicine_id: string;
  name: string;
  price: number;
  batch_number?: string;
  mfg_date?: string;
  exp_date?: string;
  thumbnail?: string;
  requires_prescription: boolean;
  category: string;
  sub_category: string;
  type: MedicineType;
  is_active: boolean;
  show_to_users: boolean;
  show_to_shops: boolean;
  show_to_vendors: boolean;
  created_by?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 🔹 Get All Medicines: GET /api/medicines
export const getMedicines = async (): Promise<{ data: Medicine[] }> => {
  const res = await API.get("/medicines");
  if (res.data && Array.isArray(res.data)) {
    return { data: res.data };
  }
  // Fallback check if it was wrapped in a standard { success: true, data } response
  if (res.data && res.data.success && Array.isArray(res.data.data)) {
    return { data: res.data.data };
  }
  throw new Error("Invalid API format received");
};

// 🔹 Create Medicine: POST /api/medicines (Stock role only)
export const createMedicine = async (
  data: Omit<Medicine, "id" | "is_active">
): Promise<{ data: Medicine }> => {
  const res = await API.post("/medicines", data);
  if (res.data) {
    return { data: res.data };
  }
  throw new Error("Invalid API format received");
};

// 🔹 Update Medicine: PUT /api/medicines/:id (Stock role only)
export const updateMedicine = async (
  id: number,
  data: Partial<Medicine>
): Promise<{ message: string }> => {
  const res = await API.put(`/medicines/${id}`, data);
  if (res.data) {
    return res.data;
  }
  throw new Error("Invalid API format received");
};

// 🔹 Toggle Active Status: PATCH /api/medicines/:id/toggle (Stock role only)
export const toggleMedicineStatus = async (
  id: number
): Promise<{ message: string; is_active: boolean }> => {
  const res = await API.patch(`/medicines/${id}/toggle`);
  if (res.data) {
    return res.data;
  }
  throw new Error("Invalid API format received");
};
