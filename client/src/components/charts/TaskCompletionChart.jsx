import { RadialBarChart, RadialBar, ResponsiveContainer, Legend, Tooltip } from "recharts";

const TaskCompletionChart = ({ completed = 0, total = 0 }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const data = [
    {
      name: "Remaining",
      value: total - completed,
      fill: "var(--color-slate-200)", // Using standard Tailwind class approximation below
      className: "fill-gray-100 dark:fill-slate-700"
    },
    {
      name: "Completed",
      value: completed,
      fill: "#10b981", // Emerald-500
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-full relative">
      <div className="mb-2 flex-shrink-0 z-10 relative">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Task Progress</h2>
        <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">Overall completion rate</p>
      </div>

      <div className="flex-1 min-h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="65%" 
            outerRadius="85%" 
            barSize={16} 
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              minAngle={15}
              background={{ fill: 'rgba(0,0,0,0.03)' }}
              clockWise
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center overlay text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {percentage}%
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
            {completed} of {total} done
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionChart;
