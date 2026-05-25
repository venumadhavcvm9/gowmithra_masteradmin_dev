import API from "../../services/api";

export const getSales = () => API.get("/sales");
export const getShopSales = () => API.get("/sales/shop-wise");