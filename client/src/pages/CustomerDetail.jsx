import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Mail, Phone, Building, Calendar,
  Edit2, Trash2, CheckCircle2, Clock, Briefcase,
  Sparkles, MessageSquare, Activity, Send, X, Loader2
} from "lucide-react";
import { customerService, leadService, taskService, aiService, activityLogService } from "../api/api";
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
  const [notes, setNotes] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [editModal, setEditModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Notes
  const [newNote, setNewNote] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // AI
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, leadsRes, tasksRes] = await Promise.all([
        customerService.getCustomer(id),
        leadService.getLeads({ search: "", limit: 100 }),
        taskService.getTasks({ search: "", limit: 100 }),
      ]);

      setCustomer(custRes.data);
      const filteredLeads = (leadsRes.data?.data || []).filter((l) => l.customer_id === parseInt(id));
      setLeads(filteredLeads);
      const filteredTasks = (tasksRes.data?.data || []).filter((t) => t.customer_id === parseInt(id));
      setTasks(filteredTasks);

      // Load notes
      try {
        const notesRes = await customerService.getNotes(id);
        setNotes(notesRes.data || []);
      } catch { setNotes([]); }

      // Load timeline
      try {
        const timelineRes = await activityLogService.getLogs({ entity_type: "customer", entity_id: id });
        setTimeline(timelineRes.data || []);
      } catch { setTimeline([]); }

    } catch (error) {
      console.warn("Failed to load customer details", error);
      addToast("Failed to load customer details", "error");
      navigate("/customers");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, addToast]);

  useEffect(() => {
    loadAll();
  }, [id, loadAll]);

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

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setNoteSubmitting(true);
    try {
      await customerService.addNote(id, newNote.trim());
      setNewNote("");
      addToast("Note added", "success");
      const notesRes = await customerService.getNotes(id);
      setNotes(notesRes.data || []);
    } catch (error) {
      console.warn("Failed to add note", error);
      addToast("Failed to add note", "error");
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await customerService.deleteNote(id, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      addToast("Note removed", "success");
    } catch (error) {
      console.warn("Failed to delete note", error);
      addToast("Failed to delete note", "error");
    }
  };

  const handleAIAssist = async () => {
    setAiLoading(true);
    setAiInsight(null);
    try {
      const res = await aiService.getCustomerAssist(id);
      setAiInsight(res.data.analysis);
      setAiSource(res.data.source || "");
    } catch (error) {
      console.warn("AI analysis failed", error);
      addToast("AI analysis failed", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
  };

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
    { id: "notes", label: `Notes (${notes.length})` },
    { id: "timeline", label: "Timeline" },
    { id: "leads", label: `Leads (${leads.length})` },
    { id: "tasks", label: `Tasks (${tasks.length})` },
    { id: "ai", label: "AI Assistant", icon: Sparkles },
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition cursor-pointer"
              >
                <Edit2 size={15} /> Edit
              </button>
              <button
                onClick={() => setDeleteDialog(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition cursor-pointer"
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
        <div className="flex border-b border-gray-200 dark:border-slate-700 px-6 overflow-x-auto">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 mr-6 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                }`}
              >
                {TabIcon && <TabIcon size={14} />}
                {tab.label}
              </button>
            );
          })}
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

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="animate-fade-in space-y-5">
              {/* Add Note input */}
              <div className="flex gap-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this customer..."
                  rows={2}
                  className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:focus:ring-cyan-500 resize-none transition"
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleAddNote(); }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={noteSubmitting || !newNote.trim()}
                  className="self-end px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 transition shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  {noteSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Add
                </button>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-slate-500">Press Ctrl+Enter to submit</p>

              {/* Notes list */}
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={40} className="mx-auto text-gray-200 dark:text-slate-700 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">No notes yet</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Add your first note above to start tracking interactions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="group p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-800 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">{note.note}</p>
                          <div className="flex items-center gap-2 mt-2.5">
                            <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                              {note.user_name || "System"}
                            </span>
                            <span className="text-gray-300 dark:text-slate-600">•</span>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500">
                              {timeAgo(note.created_at)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition cursor-pointer"
                          title="Delete note"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="animate-fade-in">
              {timeline.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={40} className="mx-auto text-gray-200 dark:text-slate-700 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">No activity recorded</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Actions related to this customer will appear here</p>
                </div>
              ) : (
                <div className="relative pl-6">
                  {/* Vertical line */}
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-slate-700" />

                  <div className="space-y-6">
                    {timeline.map((log, idx) => (
                      <div key={log.id || idx} className="relative flex gap-4">
                        {/* Dot */}
                        <div className="absolute -left-6 top-1.5 w-[18px] h-[18px] rounded-full border-2 border-white dark:border-slate-800 bg-cyan-500 shadow-sm flex-shrink-0 z-10" />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white font-medium leading-tight">
                            {log.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                              {log.user_name || "System"}
                            </span>
                            <span className="text-gray-300 dark:text-slate-600">•</span>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500">
                              {timeAgo(log.created_at)}
                            </span>
                            {log.type && (
                              <>
                                <span className="text-gray-300 dark:text-slate-600">•</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 px-1.5 py-0.5 rounded">
                                  {log.type.replace(/_/g, " ")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

          {/* AI Assistant Tab */}
          {activeTab === "ai" && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-900/10 dark:to-cyan-900/10 rounded-2xl p-6 border border-violet-100 dark:border-violet-800/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/25">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Clarior AI Assistant</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Powered by advanced intelligence</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Generate an AI-powered analysis of this customer's interactions, pipeline status, and actionable follow-up recommendations.
                </p>
                <button
                  onClick={handleAIAssist}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-semibold hover:from-violet-600 hover:to-cyan-600 transition shadow-lg shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate AI Insights
                    </>
                  )}
                </button>
              </div>

              {/* Loading state */}
              {aiLoading && (
                <div className="text-center py-10">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/30">
                    <Loader2 size={18} className="text-violet-500 animate-spin" />
                    <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                      Analyzing customer data & generating insights...
                    </span>
                  </div>
                </div>
              )}

              {/* AI Result */}
              {aiInsight && !aiLoading && (
                <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">AI Analysis</h4>
                    {aiSource && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-lg border border-violet-100 dark:border-violet-800/30">
                        {aiSource}
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {aiInsight}
                  </div>
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
