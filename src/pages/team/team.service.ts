// src/pages/team/team.service.ts

import API from "../../services/api";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STOCK" | "SALES" | "MARKETING";
  status: "ACTIVE" | "INACTIVE";
  mobile?: string;
  createdAt?: string;
}

// 🔹 Get All Employees: GET /api/admin/employees
export const getEmployees = async (): Promise<{ data: Employee[] }> => {
  const res = await API.get("/admin/employees");
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return { data: res.data.data };
  }
  throw new Error("Invalid API format received");
};

// 🔹 Create Employee: POST /api/admin/employees
export const createEmployee = async (data: {
  name: string;
  email: string;
  password?: string;
  role: "STOCK" | "SALES" | "MARKETING";
  mobile?: string;
}): Promise<{ data: Employee }> => {
  const res = await API.post("/admin/employees", data);
  if (res.data && res.data.data) {
    return { data: res.data.data };
  }
  throw new Error("Invalid API format received");
};

// 🔹 Update Employee Details: PATCH /api/admin/employees/:id
export const updateEmployee = async (
  id: number,
  data: Partial<Employee> & { password?: string }
): Promise<{ data: Employee }> => {
  const res = await API.patch(`/admin/employees/${id}`, data);
  if (res.data && res.data.data) {
    return { data: res.data.data };
  }
  throw new Error("Invalid API format received");
};

// 🔹 Update Employee Status (Hold / Active): PATCH /api/admin/employees/:id/status
export const updateEmployeeStatus = async (
  id: number,
  status: "ACTIVE" | "INACTIVE"
): Promise<{ data: Employee }> => {
  const res = await API.patch(`/admin/employees/${id}/status`, { status });
  if (res.data && res.data.data) {
    return { data: res.data.data };
  }
  throw new Error("Invalid API format received");
};
