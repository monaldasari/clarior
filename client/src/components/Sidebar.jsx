import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  BarChart3,
  Settings,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { name: "Dashboard",  path: "/",          icon: LayoutDashboard },
  { name: "Customers",  path: "/customers", icon: Users },
  { name: "Leads",      path: "/leads",     icon: Briefcase },
  { name: "Tasks",      path: "/tasks",     icon: CheckSquare },
  { name: "Reports",    path: "/reports",   icon: BarChart3 },
  { name: "Settings",   path: "/settings",  icon: Settings },
];

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Super Admin" || user?.role === "Admin";
  const initial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U";

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col flex-shrink-0 shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
              Clarior
            </h1>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
              Premium CRM
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-3 py-2 mt-1">
          Main Menu
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* Admin section visible only to admins */}
        {isAdmin && (
          <>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-3 py-2 mt-4">
              Administration
            </p>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              <ShieldCheck size={18} className="flex-shrink-0" />
              <span>Admin Panel</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom user section */}
      <div className="p-3 border-t border-gray-200 dark:border-slate-800">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer group"
        >
          {user?.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-none group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
              {user?.full_name || "Loading..."}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
              {user?.role || ""}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;