import { ArrowUpRight } from "lucide-react";

const StatsCard = ({ title, value, color }) => {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-400">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div
          className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}
        >
          <ArrowUpRight size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;