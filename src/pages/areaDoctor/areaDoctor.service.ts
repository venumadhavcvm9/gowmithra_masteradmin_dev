// src/pages/areaDoctor/areaDoctor.service.ts

import API from "../../services/api";

export interface Doctor {
  id: number;
  doctor_id: string;
  full_name: string;
  mobile: string;
  status: "ACTIVE" | "INACTIVE";
  address?: string;
  degree?: string;
  specialty?: string;
  rating?: number;
  casesResolved?: number;
  activeCases?: number;
  region?: string;
  commissionRate?: string;
  aadhaar?: string;
}

// 🔹 Get All Area Doctors: GET /api/area-doctors
export const getDoctors = async (): Promise<{ data: Doctor[] }> => {
  const res = await API.get("/area-doctors");
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return { data: res.data.data };
  }
  throw new Error("Invalid API format received");
};

// 🔹 Update Doctor Status: PATCH /api/area-doctors/:id/status
export const updateDoctorStatus = async (
  id: number,
  status: "ACTIVE" | "INACTIVE"
): Promise<{ data: Doctor }> => {
  const res = await API.patch(`/area-doctors/${id}/status`, { status });
  if (res.data && res.data.data) {
    return { data: res.data.data };
  }
  throw new Error("Invalid API format received");
};

// 🔹 Update Doctor Details: PATCH /api/area-doctors/:id
export const updateDoctorDetails = async (
  id: number,
  data: Partial<Doctor>
): Promise<{ data: Doctor }> => {
  const res = await API.patch(`/area-doctors/${id}`, data);
  if (res.data && res.data.data) {
    return { data: res.data.data };
  }
  throw new Error("Invalid API format received");
};

// 🔹 Create Area Doctor: POST /api/area-doctors
export const createDoctor = async (data: Partial<Doctor>): Promise<{ data: Doctor }> => {
  const res = await API.post("/area-doctors", data);
  if (res.data && res.data.data) {
    return { data: res.data.data };
  }
  throw new Error("Failed to create area doctor");
};
