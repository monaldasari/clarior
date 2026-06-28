import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#06b6d4", "#8b5cf6", "#f43f5e", "#f59e0b", "#10b981", "#64748b"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-xl flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {payload[0].name}: <span className="font-bold">{payload[0].value}</span>
      </p>
    </div>
  );
};

const LeadSourcesChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center h-[354px]">
        <p className="text-gray-400 dark:text-slate-500">No lead data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Lead Sources</h2>
        <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">Where your leads come from</p>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LeadSourcesChart;
