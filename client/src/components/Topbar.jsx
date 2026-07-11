import { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Bell, Search, User, LogOut, CheckCheck, Trash, Zap, Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import CommandPalette from "./ui/CommandPalette";
import { notificationService } from "../api/api";

const PAGE_TITLES = {
  "/":          "Dashboard",
  "/customers": "Customers",
  "/leads":     "Leads",
  "/tasks":     "Tasks",
  "/calendar":  "Calendar",
  "/reports":   "Reports",
  "/settings":  "Settings",
  "/profile":   "My Profile",
  "/admin":     "Admin Panel",
};

const Topbar = ({ onMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    const handleShortcut = (e) => {
      const isTyping = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
      if (
        (e.ctrlKey && e.key?.toLowerCase() === "k") || 
        (e.key === "/" && !isTyping)
      ) {
        e.preventDefault();
        setShowPalette(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const title = PAGE_TITLES[location.pathname] || "Clarior CRM";
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadNotifications();

    // Establish WebSocket Connection for Realtime Notifications
    const token = localStorage.getItem("clarior-token");
    let socket;
    const shouldUseRealtime = !import.meta.env.PROD && typeof window !== "undefined";

    if (token && shouldUseRealtime) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const apiURL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";
      const isSecurePage = window.location.protocol === "https:";
      const isMixedContent = apiURL.startsWith("http://") && isSecurePage;
      const wsHost = apiURL.startsWith("http") && !isMixedContent
        ? apiURL.replace(/^http/, protocol === "wss:" ? "wss" : "ws")
        : `${protocol}//${window.location.host}`;

      try {
        socket = new WebSocket(`${wsHost}?token=${encodeURIComponent(token)}`);

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "notification") {
              const newNotif = message.data;
              setNotifications(prev => [newNotif, ...prev]);
              addToast(`🔔 ${newNotif.title}: ${newNotif.message}`, "info");
            }
          } catch (err) {
            console.error("Error parsing websocket message:", err);
          }
        };

        socket.onerror = () => {
          // Fall back to polling when realtime notifications are unavailable.
        };
      } catch (err) {
        console.warn("WebSocket upgrade failed:", err);
      }
    }

    const interval = setInterval(loadNotifications, 15000); // Fallback polling
    return () => {
      clearInterval(interval);
      if (socket) socket.close();
    };
  }, [user, loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotif = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const initial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U";

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 shadow-sm relative z-40">
      {/* Page title with hamburger toggle on mobile */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white lg:hidden rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu size={18} />
        </button>
        <div>
          <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white leading-none">
            {title}
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 hidden sm:block">
            Welcome back, {user?.full_name?.split(" ")[0] || "User"} 👋
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block cursor-pointer" onClick={() => setShowPalette(true)}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
          />
          <input
            type="text"
            readOnly
            placeholder="Search... (Ctrl+K)"
            className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 pl-9 pr-4 py-2 rounded-xl text-sm w-52 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition cursor-pointer"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition relative"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-3 z-50 animate-fade-in origin-top-right">
                <div className="px-4 pb-2 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead} 
                      className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-700/50">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-xs text-gray-500 dark:text-slate-400">No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3.5 flex justify-between gap-2 transition hover:bg-gray-50 dark:hover:bg-slate-700/30 ${!n.is_read ? "bg-cyan-50/20 dark:bg-cyan-950/10" : ""}`}>
                        <div className="flex-1 cursor-pointer" onClick={() => handleMarkRead(n.id)}>
                          <p className={`text-xs font-bold ${!n.is_read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-slate-400"}`}>{n.title}</p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-500 mt-0.5">{n.message}</p>
                        </div>
                        <button onClick={() => handleDeleteNotif(n.id)} className="text-gray-400 hover:text-red-500 transition self-center">
                          <Trash size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />

        {/* Avatar Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          >
            {user?.profile_picture_url ? (
              <img src={user.profile_picture_url} alt="Profile" className="w-9 h-9 rounded-full object-cover shadow-md" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-cyan-500/30">
                {initial}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 hidden lg:block">
              {user?.full_name?.split(" ")[0] || "User"}
            </span>
          </div>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50 animate-fade-in origin-top-right">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                
                <Link to="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                  <User size={16} /> My Profile
                </Link>
                
                {["Super Admin", "Admin"].includes(user?.role) && (
                  <Link to="/admin" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                    <Zap size={16} /> Admin Panel
                  </Link>
                )}
                
                <div className="border-t border-gray-100 dark:border-slate-700 mt-1 pt-1">
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <CommandPalette isOpen={showPalette} onClose={() => setShowPalette(false)} />
    </header>
  );
};

export default Topbar;