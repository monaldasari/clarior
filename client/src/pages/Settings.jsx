import { useState } from "react";
import { Link } from "react-router-dom";
import { Settings as SettingsIcon, User, Bell, Shield, Database, Layout } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { setupDB, userService } from "../api/api";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("appearance");
  const [isResetting, setIsResetting] = useState(false);

  const TABS = [
    { id: "appearance", label: "Appearance", icon: Layout },
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "database", label: "Database", icon: Database },
  ];

  const handleResetDB = async () => {
    setIsResetting(true);
    try {
      await setupDB();
      addToast("Database connection verified and tables initialized", "success");
    } catch (error) {
      addToast("Failed to verify database", "error");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-gray-500 dark:text-slate-400" />
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your account preferences and system settings
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-2 shadow-sm flex flex-row md:flex-col overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gray-100 dark:bg-slate-700 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            
            {activeTab === "appearance" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Appearance</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Customize how Clarior CRM looks on your device.</p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Theme Preference</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Toggle between Light and Dark mode. This is saved to your browser.
                      </p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                    >
                      Current: {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Database Management</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Manage your connection to Neon PostgreSQL.</p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Initialize Tables</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-md">
                        Run the database setup script to ensure all required tables exist. This is safe to run multiple times and will not delete existing data.
                      </p>
                    </div>
                    <button
                      onClick={handleResetDB}
                      disabled={isResetting}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:from-blue-600 hover:to-indigo-600 transition shadow-md disabled:opacity-50"
                    >
                      {isResetting ? "Running..." : "Run Setup"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Account Summary</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">View your basic account profile credentials.</p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-700/50">
                    <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Full Name</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{user?.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-700/50">
                    <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Email Address</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-700/50">
                    <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Current Role</span>
                    <span className="px-2.5 py-0.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase rounded border border-cyan-100 dark:border-cyan-800/30">
                      {user?.role}
                    </span>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Link
                      to="/profile"
                      className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition"
                    >
                      Edit Detailed Profile
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <SecuritySettings />
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Notification Preferences</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Configure how you receive activity and lead updates.</p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-4">
                  {[
                    { id: "email_notif", label: "Email Alerts", desc: "Receive immediate email alerts for task assignments" },
                    { id: "system_notif", label: "System Messages", desc: "Show in-app notification center alerts for system news" },
                    { id: "digest_notif", label: "Weekly Digest", desc: "Receive a weekly summarized report on pipeline performance" }
                  ].map(item => (
                    <div key={item.id} className="flex items-start justify-between py-2">
                      <div className="max-w-md">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked
                        className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 mt-1" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for security password change logic
const SecuritySettings = () => {
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return addToast("Please fill all password fields", "warning");
    }
    if (newPassword !== confirmPassword) {
      return addToast("New passwords do not match", "error");
    }
    if (newPassword.length < 6) {
      return addToast("New password must be at least 6 characters long", "warning");
    }

    setLoading(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      addToast("Password changed successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Security Settings</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">Manage password configurations to protect your account.</p>
      </div>
      
      <form onSubmit={handlePasswordChange} className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold hover:from-cyan-600 hover:to-blue-600 transition shadow disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default Settings;