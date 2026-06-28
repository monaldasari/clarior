import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
  trendValue,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton w-12 h-12 rounded-xl" />
        </div>
        <div className="skeleton h-9 w-28 rounded mt-2" />
        <div className="skeleton h-3 w-20 rounded mt-3" />
      </div>
    );
  }

  const isUp = !trend || trend === "up";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon size={22} className="text-white" strokeWidth={2} />
          </div>
        )}
      </div>

      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        {value}
      </h2>

      {trendValue && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
            isUp ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{trendValue}</span>
          <span className="text-gray-400 dark:text-slate-500 font-normal ml-0.5">
            vs last month
          </span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;