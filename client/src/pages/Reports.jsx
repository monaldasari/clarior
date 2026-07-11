import { useEffect, useState, useCallback } from "react";
import { BarChart3, Download } from "lucide-react";
import { reportService } from "../api/api";
import { useToast } from "../context/ToastContext";

import RevenueChart from "../components/charts/RevenueChart";
import CustomerGrowthChart from "../components/charts/CustomerGrowthChart";
import LeadSourcesChart from "../components/charts/LeadSourcesChart";
import TaskCompletionChart from "../components/charts/TaskCompletionChart";

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("2025");
  const { addToast } = useToast();

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        setLoading(true);
        const res = await reportService.getOverview({ year });
        if (!ignore) setData(res.data);
      } catch (error) {
        if (!ignore) {
          console.warn("Failed to load reports", error);
          addToast("Failed to load reports", "error");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    run();
    return () => {
      ignore = true;
    };
  }, [year, addToast]);

  const getTaskStats = () => {
    if (!data?.taskStats) return { completed: 0, total: 0 };
    const completed = data.taskStats.find(t => t.name === "Done")?.value || 0;
    const total = data.taskStats.reduce((acc, curr) => acc + curr.value, 0);
    return { completed, total };
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-amber-500" />
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Comprehensive overview of your CRM performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-sm cursor-pointer"
          >
            <option value="2025">Year 2025</option>
            <option value="2024">Year 2024</option>
          </select>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-600 hover:to-orange-600 transition shadow-lg shadow-amber-500/30"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 h-[350px]">
              <div className="skeleton h-6 w-1/3 rounded mb-2" />
              <div className="skeleton h-4 w-1/4 rounded mb-8" />
              <div className="skeleton h-full w-full rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={data?.revenueChart} />
            <CustomerGrowthChart data={data?.customerGrowth} />
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeadSourcesChart data={data?.leadConversion} />
            <TaskCompletionChart 
              completed={getTaskStats().completed}
              total={getTaskStats().total}
            />
          </div>
          
          {/* Table representation */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">Top Performing Customers</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {data?.topCustomers?.length > 0 ? (
                    data.topCustomers.map((cust, i) => (
                      <tr key={i}>
                        <td className="py-3">
                          <p className="font-semibold text-gray-900 dark:text-white">{cust.name}</p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{cust.email}</p>
                        </td>
                        <td className="py-3 text-sm text-gray-700 dark:text-slate-300">{cust.company || "—"}</td>
                        <td className="py-3 text-sm text-gray-500 dark:text-slate-400">
                          {cust.created_at ? new Date(cust.created_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                        No customer data available for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;