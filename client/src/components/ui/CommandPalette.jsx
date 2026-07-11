import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Briefcase, CheckSquare, Settings, Moon, ArrowRight, CornerDownLeft } from "lucide-react";
import { customerService, leadService, taskService } from "../../api/api";
import { useTheme } from "../../context/ThemeContext";

const QUICK_ACTIONS = [
  { name: "Go to Dashboard", path: "/", type: "action", category: "Navigation" },
  { name: "Go to Customers", path: "/customers", type: "action", category: "Navigation" },
  { name: "Go to Leads", path: "/leads", type: "action", category: "Navigation" },
  { name: "Go to Tasks", path: "/tasks", type: "action", category: "Navigation" },
  { name: "Go to Calendar", path: "/calendar", type: "action", category: "Navigation" },
  { name: "Go to Reports", path: "/reports", type: "action", category: "Navigation" },
  { name: "Go to Settings", path: "/settings", type: "action", category: "Navigation" },
  { name: "Toggle Theme Preference", type: "theme", category: "Preferences" },
];

export const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ customers: [], leads: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Focus input on mount/open
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  // API query search
  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults({ customers: [], leads: [], tasks: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [custRes, leadsRes, tasksRes] = await Promise.all([
          customerService.getCustomers({ search: query, limit: 4 }).catch(() => ({ data: { data: [] } })),
          leadService.getLeads({ search: query, limit: 4 }).catch(() => ({ data: { data: [] } })),
          taskService.getTasks({ search: query, limit: 4 }).catch(() => ({ data: { data: [] } })),
        ]);
        
        setResults({
          customers: custRes.data?.data || [],
          leads: leadsRes.data?.data || [],
          tasks: tasksRes.data?.data || [],
        });
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter actions
  const matchedActions = QUICK_ACTIONS.filter(act => 
    act.name.toLowerCase().includes(query.toLowerCase())
  );

  // Flatten items for unified keyboard navigation indexes
  const flatItems = [
    ...matchedActions.map(act => ({ ...act, id: `action-${act.name}` })),
    ...results.customers.map(c => ({ id: `cust-${c.id}`, name: c.name, sub: c.company, path: `/customers/${c.id}`, type: "customer" })),
    ...results.leads.map(l => ({ id: `lead-${l.id}`, name: l.name, sub: `Lead Status: ${l.status}`, path: "/leads", type: "lead" })),
    ...results.tasks.map(t => ({ id: `task-${t.id}`, name: t.title, sub: `Priority: ${t.priority}`, path: "/tasks", type: "task" })),
  ];

  const handleSelect = useCallback((item) => {
    if (item.type === "action" || item.type === "customer" || item.type === "lead" || item.type === "task") {
      navigate(item.path);
    } else if (item.type === "theme") {
      toggleTheme();
    }
    onClose();
  }, [navigate, toggleTheme, onClose]);

  // Handle key triggers
  useEffect(() => {
    const handleKeys = (e) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(flatItems.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(flatItems.length, 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          handleSelect(flatItems[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [isOpen, flatItems, selectedIndex, handleSelect, onClose]);

  const getIcon = (type) => {
    switch (type) {
      case "customer": return <User size={16} className="text-cyan-500" />;
      case "lead": return <Briefcase size={16} className="text-blue-500" />;
      case "task": return <CheckSquare size={16} className="text-emerald-500" />;
      case "theme": return <Moon size={16} className="text-violet-500" />;
      default: return <Settings size={16} className="text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-slate-900/60 backdrop-blur-xs p-4">
      <div 
        ref={containerRef}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-fade-in"
      >
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-slate-800">
          <Search size={20} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type command or search across CRM..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-0 outline-none text-sm"
          />
          <button 
            onClick={onClose} 
            className="text-[10px] font-bold text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700 px-1.5 py-0.5 rounded uppercase"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {flatItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400 dark:text-slate-500">
              {loading ? "Searching indexes..." : "No items found matching search terms."}
            </div>
          ) : (
            <div className="space-y-1">
              {flatItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                      isSelected 
                        ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400" 
                        : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0">
                        {getIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{item.name}</p>
                        {item.sub && (
                          <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate mt-0.5 font-medium">{item.sub}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      {item.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-700/50">
                          {item.category}
                        </span>
                      )}
                      {isSelected ? (
                        <CornerDownLeft size={12} className="opacity-60" />
                      ) : (
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-60" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard instructions footer */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-slate-900/60 border-t border-gray-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500 font-medium">
          <div className="flex gap-4">
            <span>
              <span className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-1 py-0.5 rounded mr-1">↑↓</span>
              to navigate
            </span>
            <span>
              <span className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-1.5 py-0.5 rounded mr-1">Enter</span>
              to select
            </span>
          </div>
          <span>Search everywhere</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
