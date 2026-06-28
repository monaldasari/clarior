import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";

// App Pages
import Dashboard from "../pages/Dashboard";
import Customers from "../pages/Customers";
import CustomerDetail from "../pages/CustomerDetail";
import Leads from "../pages/Leads";
import Tasks from "../pages/Tasks";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import Admin from "../pages/Admin";

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
    <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full border border-gray-200 dark:border-slate-800">
      <h1 className="text-3xl font-bold text-red-500 mb-2">403</h1>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Access Denied</h2>
      <p className="text-gray-500 dark:text-slate-400 mb-6">You do not have permission to view this page.</p>
      <a href="/" className="inline-block px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition font-medium">Return to Dashboard</a>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="leads" element={<Leads />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Admin only route */}
          <Route element={<ProtectedRoute allowedRoles={["Super Admin", "Admin"]} />}>
            <Route path="admin" element={<Admin />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;