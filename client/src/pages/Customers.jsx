import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Plus, Edit2, Trash2, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { customerService } from "../api/api";
import { useToast } from "../context/ToastContext";
import AddCustomerModal from "../components/AddCustomerModal";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { SkeletonTable } from "../components/ui/LoadingSkeleton";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  // Open add modal if navigated with ?action=new
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditingCustomer(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getCustomers({ search, status: statusFilter, page, limit });
      setCustomers(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      addToast("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomer = async (data) => {
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, data);
        addToast("Customer updated successfully");
      } else {
        await customerService.addCustomer(data);
        addToast("Customer added successfully");
      }
      loadCustomers();
    } catch (error) {
      throw error; // Let modal handle error display
    }
  };

  const handleDelete = async () => {
    try {
      await customerService.deleteCustomer(deleteDialog.id);
      addToast("Customer deleted successfully");
      if (customers.length === 1 && page > 1) setPage(page - 1);
      else loadCustomers();
    } catch (error) {
      addToast("Failed to delete customer", "error");
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const exportCSV = () => {
    if (!customers.length) return addToast("No data to export", "warning");
    const headers = ["ID", "Name", "Email", "Phone", "Company", "Status", "Created At"];
    const csvContent = [
      headers.join(","),
      ...customers.map(c => 
        [c.id, `"${c.name}"`, `"${c.email}"`, `"${c.phone||''}"`, `"${c.company||''}"`, c.status, c.created_at].join(",")
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported successfully", "info");
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage your client base ({total} total)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-600 hover:to-blue-600 transition shadow-lg shadow-cyan-500/30"
          >
            <Plus size={18} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-t-2xl border border-b-0 border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition text-gray-900 dark:text-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-b-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold">
                <th className="p-4 pl-6">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Company</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {loading ? (
                <SkeletonTable rows={limit} cols={5} />
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Search size={40} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No customers found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link 
                            to={`/customers/${customer.id}`} 
                            className="font-semibold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                          >
                            {customer.name}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-slate-400">ID: #{customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900 dark:text-slate-200 font-medium">{customer.email}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{customer.phone || "No phone"}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {customer.company || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(customer)}
                          className="p-2 bg-gray-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: customer.id })}
                          className="p-2 bg-gray-100 dark:bg-slate-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Showing <span className="font-medium text-gray-900 dark:text-white">{(page - 1) * limit + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(page * limit, total)}</span> of <span className="font-medium text-gray-900 dark:text-white">{total}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      page === i + 1 
                        ? "bg-cyan-500 text-white" 
                        : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddCustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCustomer}
        initialData={editingCustomer}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Customers;