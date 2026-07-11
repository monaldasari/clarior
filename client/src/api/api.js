import axios from "axios";

const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor: Auto-attach JWT Token ────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("clarior-token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Customer Service ──────────────────────────────────────────────────────
export const customerService = {
  getCustomers: (params) => api.get("/customers", { params }),
  getCustomer:  (id) => api.get(`/customers/${id}`),
  addCustomer:  (data) => api.post("/customers", data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
  getNotes: (id) => api.get(`/customers/${id}/notes`),
  addNote: (id, note) => api.post(`/customers/${id}/notes`, { note }),
  deleteNote: (id, noteId) => api.delete(`/customers/${id}/notes/${noteId}`),
};

// ─── Lead Service ──────────────────────────────────────────────────────────
export const leadService = {
  getLeads:  (params) => api.get("/leads", { params }),
  getLead:   (id) => api.get(`/leads/${id}`),
  addLead:   (data) => api.post("/leads", data),
  updateLead: (id, data) => api.put(`/leads/${id}`, data),
  deleteLead: (id) => api.delete(`/leads/${id}`),
  updateStatus: (leadId, newStatus) => api.post("/leads/batch-status", { leadId, newStatus }),
};

// ─── Task Service ──────────────────────────────────────────────────────────
export const taskService = {
  getTasks:  (params) => api.get("/tasks", { params }),
  getTask:   (id) => api.get(`/tasks/${id}`),
  addTask:   (data) => api.post("/tasks", data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  updateStatus: (taskId, newStatus) => api.post("/tasks/batch-status", { taskId, newStatus }),
};

// ─── Dashboard Service ─────────────────────────────────────────────────────
export const dashboardService = {
  getSummary: () => api.get("/dashboard/summary"),
};

// ─── Report Service ────────────────────────────────────────────────────────
export const reportService = {
  getOverview: (params) => api.get("/reports/overview", { params }),
};

// ─── Activity Service ──────────────────────────────────────────────────────
export const activityService = {
  getLogs: () => api.get("/activity-logs"),
};

// ─── Activity Log Service (with filters) ───────────────────────────────────
export const activityLogService = {
  getLogs: (params) => api.get("/activity-logs", { params }),
};

// ─── Notification Service ──────────────────────────────────────────────────
export const notificationService = {
  getNotifications: () => api.get("/api/notifications"),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllRead: () => api.put("/api/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
};

// ─── User Service ──────────────────────────────────────────────────────────
export const userService = {
  getMe: () => api.get("/api/auth/me"),
  updateProfile: (data) => api.put("/api/users/me", data),
  uploadAvatar: (formData) => api.post("/api/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  changePassword: (data) => api.put("/api/users/change-password", data),
  // Admin only
  getAllUsers: () => api.get("/api/users"),
  createUser: (data) => api.post("/api/users", data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
};

// ─── Auth Service ──────────────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/api/auth/reset-password", data),
  verifyEmail: (token) => api.post("/api/auth/verify-email", { token }),
};

// ─── AI CRM Assistant Service ──────────────────────────────────────────────
export const aiService = {
  getCustomerAssist: (id) => api.get(`/api/ai/customers/${id}/ai-assist`),
};

// ─── DB Setup ──────────────────────────────────────────────────────────────
export const setupDB = () => api.post("/setup-db");

export default api;