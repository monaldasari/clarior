import { CheckSquare, Calendar } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

const UpcomingTasks = ({ tasks = [], loading = false }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckSquare size={18} className="text-emerald-500" />
          Upcoming Tasks
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[300px]">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-start py-2">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-slate-500">
            <p className="text-sm">No upcoming tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group flex flex-col gap-2 p-3 border border-gray-100 dark:border-slate-700/60 rounded-xl hover:border-cyan-500/30 dark:hover:border-cyan-500/30 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">
                    {task.title}
                  </p>
                  <StatusBadge status={task.priority} />
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                    <Calendar size={13} />
                    <span>
                      {task.due_date 
                        ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : "No due date"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-400 dark:text-slate-500">
                    {task.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingTasks;
