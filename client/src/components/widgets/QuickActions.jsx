import { UserPlus, Briefcase, CheckSquare, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const ACTIONS = [
  {
    name: "Add Customer",
    icon: UserPlus,
    path: "/customers?action=new",
    color: "text-violet-500",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    hover: "hover:bg-violet-50 dark:hover:bg-violet-900/20",
    border: "border-violet-100 dark:border-violet-800/50"
  },
  {
    name: "New Lead",
    icon: Briefcase,
    path: "/leads?action=new",
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    hover: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
    border: "border-blue-100 dark:border-blue-800/50"
  },
  {
    name: "Create Task",
    icon: CheckSquare,
    path: "/tasks?action=new",
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    border: "border-emerald-100 dark:border-emerald-800/50"
  },
  {
    name: "Generate Report",
    icon: FileText,
    path: "/reports",
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    hover: "hover:bg-amber-50 dark:hover:bg-amber-900/20",
    border: "border-amber-100 dark:border-amber-800/50"
  }
];

const QuickActions = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
      <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              to={action.path}
              className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border ${action.border} ${action.bg} ${action.hover} transition-all duration-200 group`}
            >
              <div className={`p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm group-hover:scale-110 transition-transform duration-200 ${action.color}`}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 text-center leading-tight">
                {action.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
