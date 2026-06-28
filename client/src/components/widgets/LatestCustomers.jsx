import StatusBadge from "../ui/StatusBadge";
import { Users } from "lucide-react";

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
};

const LatestCustomers = ({ customers = [], loading = false }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={18} className="text-violet-500" />
          Latest Customers
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[300px]">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="flex gap-3 items-center">
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-2 w-16 rounded" />
                  </div>
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-slate-500">
            <p className="text-sm">No customers yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex justify-between items-center p-2.5 hover:bg-gray-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition">
                    {getInitials(customer.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate max-w-[120px]">
                      {customer.company || customer.email}
                    </p>
                  </div>
                </div>

                <StatusBadge status={customer.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestCustomers;