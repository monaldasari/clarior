import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Search, Plus, Edit2, Trash2, Filter, 
  ChevronLeft, ChevronRight, Briefcase, 
  LayoutGrid, List, CheckCircle2, TrendingUp, DollarSign
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { leadService } from "../api/api";
import { useToast } from "../context/ToastContext";
import LeadModal from "../components/leads/LeadModal";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { SkeletonTable } from "../components/ui/LoadingSkeleton";

const LEAD_STAGES = ["New", "Contacted", "Qualified", "Won", "Lost"];

const Leads = () => {
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // View Toggle: "list" or "kanban"
  const [viewMode, setViewMode] = useState("kanban");
  
  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50; // Larger limit for kanban/pipeline view to see more cards

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  const { addToast } = useToast();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditingLead(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await leadService.getLeads({ search, status: statusFilter, page, limit });
      setLeads(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      addToast("Failed to load leads", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (data) => {
    try {
      if (editingLead) {
        await leadService.updateLead(editingLead.id, data);
        addToast("Lead updated successfully", "success");
      } else {
        await leadService.addLead(data);
        addToast("Lead added successfully", "success");
      }
      loadLeads();
    } catch (error) {
      addToast("Error saving lead", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await leadService.deleteLead(deleteDialog.id);
      addToast("Lead deleted successfully", "success");
      if (leads.length === 1 && page > 1) setPage(page - 1);
      else loadLeads();
    } catch (error) {
      addToast("Failed to delete lead", "error");
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const openEdit = (lead) => {
    setEditingLead(lead);
    setModalOpen(true);
  };

  // Drag and Drop Handler
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // If dropped in the same column at the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const leadId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Optimistically update frontend state
    const updatedLeads = leads.map(l => {
      if (l.id === leadId) {
        return { ...l, status: newStatus };
      }
      return l;
    });
    setLeads(updatedLeads);

    try {
      await leadService.updateStatus(leadId, newStatus);
      addToast(`Moved lead to ${newStatus}`, "success");
    } catch (err) {
      addToast("Failed to update status in server", "error");
      loadLeads(); // Revert state from server
    }
  };

  // Organize leads by status for Kanban Board
  const getLeadsByStage = (stage) => {
    return leads.filter(l => l.status === stage);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="text-blue-500" />
            Leads & Pipeline
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Track and convert your potential customers ({total} total)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-lg transition ${viewMode === "kanban" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-slate-400"}`}
              title="Pipeline View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-slate-400"}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={() => { setEditingLead(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:from-blue-600 hover:to-indigo-600 transition shadow-lg shadow-blue-500/30"
          >
            <Plus size={18} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Leads</p>
            <h3 className="text-xl font-bold text-gray-950 dark:text-white mt-0.5">{total}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Won Leads</p>
            <h3 className="text-xl font-bold text-gray-950 dark:text-white mt-0.5">
              {leads.filter(l => l.status === "Won").length}
            </h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Pipeline</p>
            <h3 className="text-xl font-bold text-gray-950 dark:text-white mt-0.5">
              {leads.filter(l => ["New", "Contacted", "Qualified"].includes(l.status)).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 mb-6 flex flex-col sm:flex-row justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition text-gray-900 dark:text-white"
          />
        </div>
        
        {viewMode === "list" && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition text-gray-900 dark:text-white cursor-pointer"
              >
                <option value="All">All Statuses</option>
                {LEAD_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && leads.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
          <SkeletonTable rows={5} cols={5} />
        </div>
      ) : viewMode === "list" ? (
        /* List View Mode */
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold">
                  <th className="p-4 pl-6">Lead</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Source / Assignee</th>
                  <th className="p-4">Priority / Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500 dark:text-slate-400">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors group">
                      <td className="p-4 pl-6">
                        <p className="font-semibold text-gray-900 dark:text-white">{lead.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{lead.company || "—"}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-900 dark:text-slate-200">{lead.email || "—"}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{lead.phone || "—"}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-700 dark:text-slate-300">{lead.source}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{lead.assigned_user_name || "Unassigned"}</p>
                      </td>
                      <td className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-slate-400 w-12">Priority:</span>
                          <StatusBadge status={lead.priority} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-slate-400 w-12">Status:</span>
                          <StatusBadge status={lead.status} />
                        </div>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(lead)}
                            className="p-2 bg-gray-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, id: lead.id })}
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
      ) : (
        /* Kanban / Pipeline View Mode */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
            {LEAD_STAGES.map((stage) => {
              const stageLeads = getLeadsByStage(stage);
              return (
                <div key={stage} className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-3xl border border-gray-200 dark:border-slate-800 flex flex-col min-w-[220px]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{stage}</span>
                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-400 text-xs font-bold rounded-lg">
                      {stageLeads.length}
                    </span>
                  </div>

                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[300px] rounded-2xl p-1 transition-colors ${
                          snapshot.isDraggingOver ? "bg-cyan-50/40 dark:bg-cyan-950/20" : ""
                        }`}
                      >
                        {stageLeads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={String(lead.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition group ${
                                  snapshot.isDragging ? "shadow-xl border-cyan-500 rotate-1 scale-102" : ""
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{lead.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{lead.company || "No Company"}</p>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                    <button 
                                      onClick={() => openEdit(lead)}
                                      className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button 
                                      onClick={() => setDeleteDialog({ isOpen: true, id: lead.id })}
                                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/50 flex justify-between items-center text-xs">
                                  <span className="text-gray-400 dark:text-slate-500 font-medium truncate max-w-[100px]">
                                    {lead.assigned_user_name || "Unassigned"}
                                  </span>
                                  <StatusBadge status={lead.priority} />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveLead}
        initialData={editingLead}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Leads;