import { useEffect, useState } from "react";
import { customerService } from "../api/api";
import AddCustomerModal from "../components/AddCustomerModal";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCustomer = async (customer) => {
    try {
      await customerService.addCustomer(customer);
      loadCustomers();
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Customers</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-3 rounded-lg font-semibold transition"
        >
          + Add Customer
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-t border-slate-700 hover:bg-slate-700 transition"
              >
                <td className="p-4">{customer.id}</td>
                <td className="p-4">{customer.name}</td>
                <td className="p-4">{customer.email}</td>
                <td className="p-4">{customer.company}</td>
                <td className="p-4">
                  <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                    {customer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddCustomerModal
          onClose={() => setShowModal(false)}
          onSave={handleAddCustomer}
        />
      )}
    </div>
  );
};

export default Customers;