import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

export const customerService = {
  getCustomers: () => api.get("/customers"),

  addCustomer: (customer) => api.post("/customers", customer),
};

export default api;