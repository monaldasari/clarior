import { FaUserPlus, FaCheckCircle, FaFileInvoice } from "react-icons/fa";

const activities = [
  {
    icon: <FaUserPlus className="text-cyan-400" />,
    text: "John Doe joined as customer",
    time: "5 min ago",
  },
  {
    icon: <FaCheckCircle className="text-green-400" />,
    text: "Task completed",
    time: "20 min ago",
  },
  {
    icon: <FaFileInvoice className="text-orange-400" />,
    text: "Invoice #238 paid",
    time: "1 hour ago",
  },
];

const RecentActivity = () => {
  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">
        Recent Activity
      </h2>

      <div className="space-y-5">
        {activities.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{item.icon}</div>

              <div>
                <p>{item.text}</p>

                <p className="text-sm text-slate-400">
                  {item.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;