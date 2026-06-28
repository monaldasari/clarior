import { useState } from "react";

const AddCustomerModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    status: "Active",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-[450px]">
        <h2 className="text-2xl font-bold mb-6">
          Add Customer
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-slate-700 p-3 rounded-lg outline-none"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-slate-700 p-3 rounded-lg outline-none"
            required
          />

          <input
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            className="w-full bg-slate-700 p-3 rounded-lg outline-none"
            required
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full bg-slate-700 p-3 rounded-lg"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-slate-600 hover:bg-slate-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;