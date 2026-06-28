import StatsCard from "../components/StatsCard";

import RevenueChart from "../components/charts/RevenueChart";
import CustomerGrowthChart from "../components/charts/CustomerGrowthChart";

import RecentActivity from "../components/widgets/RecentActivity";
import LatestCustomers from "../components/widgets/LatestCustomers";
import SalesPieChart from "../components/widgets/SalesPieChart";

const Dashboard = () => {
  return (
    <div className="space-y-8">

      {/* Heading */}
      <h1 className="text-4xl font-bold">
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatsCard
          title="Revenue"
          value="$84,230"
          color="bg-cyan-500"
        />

        <StatsCard
          title="Customers"
          value="1,284"
          color="bg-purple-500"
        />

        <StatsCard
          title="Leads"
          value="523"
          color="bg-pink-500"
        />

        <StatsCard
          title="Tasks"
          value="47"
          color="bg-orange-500"
        />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <RevenueChart />

        <CustomerGrowthChart />

      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <RecentActivity />

        <LatestCustomers />

      </div>

      {/* Pie Chart */}
      <div>

        <SalesPieChart />

      </div>

    </div>
  );
};

export default Dashboard;