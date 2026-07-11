import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Users, Briefcase, CheckSquare, RefreshCw, AlertTriangle, Plus } from "lucide-react";
import { dashboardService } from "../api/api";

import StatsCard from "../components/StatsCard";
import RevenueChart from "../components/charts/RevenueChart";
import CustomerGrowthChart from "../components/charts/CustomerGrowthChart";
import LeadSourcesChart from "../components/charts/LeadSourcesChart";
import TaskCompletionChart from "../components/charts/TaskCompletionChart";
import RecentActivity from "../components/widgets/RecentActivity";
import LatestCustomers from "../components/widgets/LatestCustomers";
import UpcomingTasks from "../components/widgets/UpcomingTasks";
import QuickActions from "../components/widgets/QuickActions";

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-lg w-24" />
      <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-xl" />
    </div>
    <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-lg w-20 mb-2" />
    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-lg w-16" />
  </div>
);

const SkeletonChart = ({ height = "h-72" }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm animate-pulse`}>
    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-lg w-40 mb-2" />
    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-lg w-32 mb-6" />
    <div className={`${height} bg-gray-100 dark:bg-slate-700/50 rounded-xl`} />
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getSummary();
      setData(res.data);
    } catch (err) {
      setError("Unable to load dashboard data. Please check your connection and try again.");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val) => new Intl.NumberFormat("en-US").format(val);

  // Error state with retry
  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto pb-10">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Unavailable</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mb-6">{error}</p>
          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 transition shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading skeleton state
  if (loading && !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2"><SkeletonChart /></div>
          <SkeletonChart height="h-52" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2"><SkeletonChart /></div>
          <SkeletonChart height="h-52" />
        </div>
      </div>
    );
  }

  // Empty state — data loaded but workspace is brand new
  const isEmpty = data && data.totalCustomers === 0 && data.totalLeads === 0 && data.pendingTasks === 0;
  if (isEmpty) {
    return (
      <div className="max-w-7xl mx-auto pb-10">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20">
            <Briefcase size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Clarior CRM</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
            Your workspace is ready! Start by adding your first customer, creating a lead, or assigning a task to see your dashboard come to life.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/customers?action=new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 transition shadow-lg shadow-cyan-500/25"
            >
              <Plus size={16} /> Add Customer
            </Link>
            <Link
              to="/leads?action=new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-semibold hover:from-violet-600 hover:to-violet-700 transition shadow-lg shadow-violet-500/25"
            >
              <Plus size={16} /> Create Lead
            </Link>
            <Link
              to="/tasks?action=new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-700 transition shadow-lg shadow-amber-500/25"
            >
              <Plus size={16} /> New Task
            </Link>
          </div>
        </div>

        {/* Still show revenue chart if seeded */}
        {data.totalRevenue > 0 && (
          <div className="mt-8">
            <RevenueChart data={data.revenueChart || []} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Revenue"
          value={data ? formatCurrency(data.totalRevenue) : "$0"}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-cyan-400 to-cyan-600"
          trend="up"
          trendValue="12.5%"
          loading={loading}
        />
        <StatsCard
          title="Total Customers"
          value={data ? formatNumber(data.totalCustomers) : "0"}
          icon={Users}
          gradient="bg-gradient-to-br from-violet-400 to-violet-600"
          trend="up"
          trendValue="8.2%"
          loading={loading}
        />
        <StatsCard
          title="Active Leads"
          value={data ? formatNumber(data.totalLeads) : "0"}
          icon={Briefcase}
          gradient="bg-gradient-to-br from-fuchsia-400 to-fuchsia-600"
          trend="down"
          trendValue="2.1%"
          loading={loading}
        />
        <StatsCard
          title="Pending Tasks"
          value={data ? formatNumber(data.pendingTasks) : "0"}
          icon={CheckSquare}
          gradient="bg-gradient-to-br from-amber-400 to-amber-600"
          trend="up"
          trendValue="5.4%"
          loading={loading}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 min-w-0">
          <RevenueChart data={data?.revenueChart || []} />
        </div>
        <div className="min-w-0">
          <TaskCompletionChart 
            completed={data?.taskCompletion?.completed || 0}
            total={data?.taskCompletion?.total || 0}
          />
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 min-w-0">
          <CustomerGrowthChart data={data?.customerGrowthChart || []} />
        </div>
        <div className="min-w-0">
          <LeadSourcesChart data={data?.leadSources || []} />
        </div>
      </div>

      {/* Widgets Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 min-w-0">
          <RecentActivity logs={data?.recentActivity || []} loading={loading} />
        </div>
        <div className="min-w-0">
          <LatestCustomers customers={data?.latestCustomers || []} loading={loading} />
        </div>
      </div>

      {/* Widgets Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 min-w-0">
          <UpcomingTasks tasks={data?.upcomingTasks || []} loading={loading} />
        </div>
        <div className="min-w-0">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;