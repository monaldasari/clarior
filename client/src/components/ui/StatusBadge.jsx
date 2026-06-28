const BADGE_STYLES = {
  // Customer
  Active:       "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Inactive:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  // Lead statuses
  New:          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Contacted:    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Qualified:    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Won:          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Lost:         "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  // Task statuses
  Todo:         "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
  "In Progress":"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Done:         "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  // Priority
  High:         "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Medium:       "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Low:          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const StatusBadge = ({ status, className = "" }) => {
  const style = BADGE_STYLES[status] ?? "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${style} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
