const customers = [
  {
    name: "John Doe",
    company: "Google",
  },
  {
    name: "Alice Smith",
    company: "Microsoft",
  },
  {
    name: "Rahul Kumar",
    company: "Amazon",
  },
  {
    name: "Sophia Lee",
    company: "Netflix",
  },
];

const LatestCustomers = () => {
  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">
        Latest Customers
      </h2>

      <div className="space-y-5">
        {customers.map((customer, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b border-slate-700 pb-3"
          >
            <div>
              <p className="font-semibold">{customer.name}</p>
              <p className="text-sm text-slate-400">
                {customer.company}
              </p>
            </div>

            <span className="bg-cyan-500 px-3 py-1 rounded-full text-sm">
              New
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestCustomers;