import { useEffect, useState } from "react";
import { DollarSign, Users, Briefcase, CheckSquare } from "lucide-react";
import { dashboardService } from "../api/api";
import { useToast } from "../context/ToastContext";

import StatsCard from "../components/StatsCard";
import RevenueChart from "../components/charts/RevenueChart";
import CustomerGrowthChart from "../components/charts/CustomerGrowthChart";
import LeadSourcesChart from "../components/charts/LeadSourcesChart";
import TaskCompletionChart from "../components/charts/TaskCompletionChart";
import RecentActivity from "../components/widgets/RecentActivity";
import LatestCustomers from "../components/widgets/LatestCustomers";
import UpcomingTasks from "../components/widgets/UpcomingTasks";
import QuickActions from "../components/widgets/QuickActions";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getSummary();
      setData(res.data);
    } catch (err) {
      addToast("Failed to load dashboard data", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val) => new Intl.NumberFormat("en-US").format(val);

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