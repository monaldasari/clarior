import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", customers: 120 },
  { month: "Feb", customers: 180 },
  { month: "Mar", customers: 250 },
  { month: "Apr", customers: 340 },
  { month: "May", customers: 410 },
  { month: "Jun", customers: 520 },
];

const CustomerGrowthChart = () => {
  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">
        Customer Growth
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="customers" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerGrowthChart;