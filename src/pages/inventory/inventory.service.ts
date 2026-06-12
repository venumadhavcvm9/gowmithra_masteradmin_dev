import api from "../../services/api";

export interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  image?: string;
}

export interface Shop {
  id: number;
  shop_id?: string | number;
  shop_name?: string;
  name?: string;
  shop_contact?: string;
  contact_number?: string;
  status?: string;
}

export interface InventoryStock {
  id: number;
  medicine_id: number;
  shop_id: number | null;
  quantity: number;
  batch_number: string;
  expiry_date: string;
  medicine: Medicine;
  shop?: Shop;
}

export interface InventoryLedger {
  id: number;
  medicine_id: number;
  from_shop_id: number | null;
  to_shop_id: number | null;
  transaction_type: string;
  quantity: number;
  batch_number: string;
  reference_id: string;
  notes: string;
  createdAt: string;
  medicine: Medicine;
}

export const getAgencyStock = async (params: { search?: string }) => {
  const response = await api.get("/inventory/agency", { params });
  return response.data;
};

export const getShopStock = async (params: { shop_id?: number; search?: string }) => {
  const response = await api.get("/inventory/shops", { params });
  return response.data;
};

export const getLedger = async (params: { page?: number; limit?: number; shop_id?: number; type?: string }) => {
  const response = await api.get("/inventory/ledger", { params });
  return response.data;
};

export const addInwardStock = async (data: {
  medicine_id: number;
  quantity: number;
  batch_number: string;
  expiry_date: string;
  notes?: string;
  invoice_id?: string;
}) => {
  const response = await api.post("/inventory/inward", data);
  return response.data;
};

export const transferStockToShop = async (data: {
  medicine_id: number;
  to_shop_id: number;
  quantity: number;
  batch_number: string;
  notes?: string;
}) => {
  const response = await api.post("/inventory/transfer", data);
  return response.data;
};
