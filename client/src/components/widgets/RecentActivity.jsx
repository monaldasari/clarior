import { FaUserPlus, FaCheckCircle, FaFileInvoice, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const getIconForType = (type) => {
  if (type.includes("add") || type.includes("create")) return <FaPlus className="text-emerald-500" />;
  if (type.includes("update") || type.includes("edit")) return <FaEdit className="text-blue-500" />;
  if (type.includes("delete") || type.includes("remove")) return <FaTrash className="text-red-500" />;
  if (type.includes("complete")) return <FaCheckCircle className="text-emerald-500" />;
  if (type.includes("customer")) return <FaUserPlus className="text-purple-500" />;
  return <FaFileInvoice className="text-gray-400" />;
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const RecentActivity = ({ logs = [], loading = false }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Activity</h2>
        <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded-md">
          Timeline
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 min-h-[300px]">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4">
                <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1 pt-1">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-2 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-slate-500">
            <FaFileInvoice size={32} className="mb-3 opacity-20" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="relative border-l border-gray-100 dark:border-slate-700 ml-4 space-y-6 pb-4">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-6">
                {/* Timeline dot */}
                <div className="absolute -left-4 top-1 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center shadow-sm text-sm">
                  {getIconForType(log.type)}
                </div>
                
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-slate-700/50">
                  <p className="text-sm text-gray-800 dark:text-slate-200 font-medium">
                    {log.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 font-medium">
                    {formatTimeAgo(log.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;