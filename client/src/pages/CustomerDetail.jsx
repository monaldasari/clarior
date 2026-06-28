import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, User, Mail, Phone, Building, Calendar,
  Edit2, Trash2, CheckCircle2, XCircle, Clock, Briefcase
} from "lucide-react";
import { customerService, leadService, taskService } from "../api/api";
import { useToast } from "../context/ToastContext";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import AddCustomerModal from "../components/AddCustomerModal";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [editModal, setEditModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    loadAll();
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [custRes, leadsRes, tasksRes] = await Promise.all([
        customerService.getCustomer(id),
        leadService.getLeads({ search: "", limit: 100 }),
        taskService.getTasks({ search: "", limit: 100 }),
      ]);
      setCustomer(custRes.data);
      // Filter leads/tasks loosely matching customer company or name
      const custName = custRes.data.name?.toLowerCase();
      const custCompany = custRes.data.company?.toLowerCase();
      setLeads(
        (leadsRes.data.data || []).filter(
          (l) =>
            (custCompany && l.company?.toLowerCase() === custCompany) ||
            l.name?.toLowerCase() === custName
        )
      );
      setTasks(
        (tasksRes.data.data || []).filter(
          (t) =>
            custCompany &&
            t.description?.toLowerCase().includes(custCompany)
        )
      );
    } catch (err) {
      addToast("Failed to load customer details", "error");
      navigate("/customers");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    await customerService.updateCustomer(id, data);
    addToast("Customer updated", "success");
    loadAll();
  };

  const handleDelete = async () => {
    await customerService.deleteCustomer(id);
    addToast("Customer deleted", "success");
    navigate("/customers");
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pb-10 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-xl w-1/3" />
        <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-3xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "leads", label: `Leads (${leads.length})` },
    { id: "tasks", label: `Tasks (${tasks.length})` },
  ];

  const initial = customer.name?.charAt(0).toUpperCase() || "C";

  return (
    <div className="max-w-5xl mx-auto pb-10 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-slate-400">
        <Link to="/customers" className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition font-medium">
          <ArrowLeft size={16} />
          Customers
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">{customer.name}</span>
      </div>

      {/* Hero Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 -mt-10">
            {/* Avatar */}
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-slate-800">
                {initial}
              </div>
              <div className="mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {customer.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">{customer.company || "No Company"}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:mt-0 mt-2 self-end sm:self-auto">
              <StatusBadge status={customer.status} />
              <button
                onClick={() => setEditModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                <Edit2 size={15} /> Edit
              </button>
              <button
                onClick={() => setDeleteDialog(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Email", value: customer.email, icon: Mail, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
          { label: "Phone", value: customer.phone || "—", icon: Phone, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
          { label: "Company", value: customer.company || "—", icon: Building, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Added", value: formatDate(customer.created_at), icon: Calendar, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} flex-shrink-0`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-slate-700 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 mr-6 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">Contact Information</h3>
                  <dl className="space-y-3">
                    {[
                      { label: "Full Name", value: customer.name },
                      { label: "Email Address", value: customer.email },
                      { label: "Phone Number", value: customer.phone || "—" },
                      { label: "Company", value: customer.company || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-2.5 border-b border-gray-50 dark:border-slate-700/50">
                        <dt className="text-sm text-gray-500 dark:text-slate-400 font-medium">{label}</dt>
                        <dd className="text-sm font-semibold text-gray-900 dark:text-white max-w-[60%] text-right truncate">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">Account Details</h3>
                  <dl className="space-y-3">
                    {[
                      { label: "Status", value: customer.status },
                      { label: "Customer ID", value: `#${customer.id}` },
                      { label: "Date Added", value: formatDate(customer.created_at) },
                      { label: "Linked Leads", value: `${leads.length} lead${leads.length !== 1 ? "s" : ""}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-2.5 border-b border-gray-50 dark:border-slate-700/50">
                        <dt className="text-sm text-gray-500 dark:text-slate-400 font-medium">{label}</dt>
                        <dd className="text-sm font-semibold text-gray-900 dark:text-white">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === "leads" && (
            <div className="animate-fade-in">
              {leads.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                  <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No linked leads found</p>
                  <p className="text-xs mt-1 text-gray-400">Leads matching this customer's company will appear here</p>
                  <Link
                    to="/leads?action=new"
                    className="inline-block mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition shadow"
                  >
                    Add Lead
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{lead.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{lead.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={lead.priority} />
                        <StatusBadge status={lead.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="animate-fade-in">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                  <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No linked tasks found</p>
                  <p className="text-xs mt-1 text-gray-400">Tasks mentioning this company in their description will appear here</p>
                  <Link
                    to="/tasks?action=new"
                    className="inline-block mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow"
                  >
                    Create Task
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        {task.completed ? (
                          <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Clock size={20} className="text-amber-500 flex-shrink-0" />
                        )}
                        <div>
                          <p className={`font-semibold text-sm ${task.completed ? "line-through text-gray-400 dark:text-slate-500" : "text-gray-900 dark:text-white"}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            Due: {formatDate(task.due_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AddCustomerModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        onSave={handleSave}
        initialData={customer}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialog}
        title="Delete Customer"
        message={`Are you sure you want to permanently delete ${customer.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(false)}
      />
    </div>
  );
};

export default CustomerDetail;
