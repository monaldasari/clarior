import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Search, Plus, Trash2, Filter, 
  CheckSquare, Calendar, MoreVertical, 
  LayoutGrid, List, Edit2
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { taskService } from "../api/api";
import { useToast } from "../context/ToastContext";
import TaskModal from "../components/tasks/TaskModal";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmDialog from "../components/ui/ConfirmDialog";

const TASK_STATUSES = ["Todo", "In Progress", "Done"];

const Tasks = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // View Toggle: "board" or "grid"
  const [viewMode, setViewMode] = useState("board");
  
  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  const { addToast } = useToast();

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks({ search, status: statusFilter, page, limit });
      setTasks(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.warn("Failed to load tasks", error);
      addToast("Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, addToast]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditingTask(null);
      setModalOpen(true);
    }
  }, [searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const handleSaveTask = async (data) => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, data);
        addToast("Task updated successfully", "success");
      } else {
        await taskService.addTask(data);
        addToast("Task added successfully", "success");
      }
      loadTasks();
    } catch (error) {
      console.warn("Error saving task", error);
      addToast("Error saving task", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await taskService.deleteTask(deleteDialog.id);
      addToast("Task deleted successfully", "success");
      if (tasks.length === 1 && page > 1) setPage(page - 1);
      else loadTasks();
    } catch (error) {
      console.warn("Failed to delete task", error);
      addToast("Failed to delete task", "error");
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const toggleComplete = async (task) => {
    try {
      const isCompleted = !task.completed;
      const newStatus = isCompleted ? "Done" : (task.status === "Done" ? "Todo" : task.status);
      
      // Optimistic update
      const updated = tasks.map(t => {
        if (t.id === task.id) {
          return { ...t, completed: isCompleted, status: newStatus };
        }
        return t;
      });
      setTasks(updated);

      await taskService.updateTask(task.id, { ...task, completed: isCompleted, status: newStatus });
      addToast(isCompleted ? "Task marked as done" : "Task reopened", "success");
      loadTasks();
    } catch (error) {
      console.warn("Failed to update task", error);
      addToast("Failed to update task", "error");
      loadTasks();
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    const completed = newStatus === "Done";

    // Optimistic Update
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus, completed };
      }
      return t;
    });
    setTasks(updated);

    try {
      await taskService.updateStatus(taskId, newStatus);
      addToast(`Moved task to ${newStatus}`, "success");
    } catch (error) {
      console.warn("Failed to move task status", error);
      addToast("Failed to move task status", "error");
      loadTasks();
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    date.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(t => t.status === status);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="text-emerald-500" />
            Tasks & Activity Board
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage, prioritize, and track your daily tasks ({total} total)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("board")}
              className={`p-2 rounded-lg transition ${viewMode === "board" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 dark:text-slate-400"}`}
              title="Board View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 dark:text-slate-400"}`}
              title="Grid View"
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={() => { setEditingTask(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/30"
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 mb-6 flex flex-col sm:flex-row justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition text-gray-900 dark:text-white"
          />
        </div>

        {viewMode === "grid" && (
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition text-gray-900 dark:text-white cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Main Task Area */}
      {loading && tasks.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-50 dark:bg-slate-900 p-4 rounded-3xl h-[400px] border border-gray-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map(task => (
            <div 
              key={task.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border shadow-sm transition-all group ${
                task.completed 
                  ? "border-gray-200 dark:border-slate-700 opacity-60 hover:opacity-100" 
                  : "border-gray-200 dark:border-slate-700 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => toggleComplete(task)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition ${
                      task.completed 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "border-gray-300 dark:border-slate-500 text-transparent hover:border-emerald-500"
                    }`}
                  >
                    <CheckSquare size={12} strokeWidth={4} />
                  </button>
                  <div onClick={() => openEdit(task)} className="cursor-pointer">
                    <h3 className={`font-semibold text-gray-900 dark:text-white leading-tight ${task.completed ? "line-through text-gray-500 dark:text-slate-400" : ""}`}>
                      {task.title}
                    </h3>
                    {task.category && (
                      <span className="text-[10px] font-bold tracking-wider text-gray-400 dark:text-slate-500 uppercase">
                        {task.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative group/menu cursor-pointer">
                  <MoreVertical size={16} className="text-gray-400 hover:text-gray-700 dark:hover:text-slate-300" />
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                    <button onClick={() => openEdit(task)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 first:rounded-t-xl">Edit</button>
                    <button onClick={() => setDeleteDialog({ isOpen: true, id: task.id })} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 last:rounded-b-xl">Delete</button>
                  </div>
                </div>
              </div>

              {task.description && (
                <p className={`text-sm mb-4 line-clamp-2 ${task.completed ? "text-gray-400 dark:text-slate-500" : "text-gray-600 dark:text-slate-400"}`}>
                  {task.description}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <StatusBadge status={task.status} />
                  <StatusBadge status={task.priority} />
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-slate-400 mt-1">
                  <div className={`flex items-center gap-1 ${isOverdue(task.due_date) && !task.completed ? "text-red-500 font-medium" : ""}`}>
                    <Calendar size={13} />
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                  {task.assigned_user_name && (
                    <span className="truncate max-w-[100px] font-medium text-gray-600 dark:text-slate-300">
                      {task.assigned_user_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Board / Kanban View */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {TASK_STATUSES.map((status) => {
              const statusTasks = getTasksByStatus(status);
              return (
                <div key={status} className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-gray-200 dark:border-slate-800 flex flex-col min-h-[500px]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-sm text-gray-800 dark:text-slate-200 uppercase tracking-wider">{status}</span>
                    <span className="px-2.5 py-0.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-400 text-xs font-bold rounded-lg">
                      {statusTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[400px] rounded-2xl p-1 transition-colors ${
                          snapshot.isDraggingOver ? "bg-emerald-50/20 dark:bg-emerald-950/10" : ""
                        }`}
                      >
                        {statusTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm hover:shadow transition group cursor-grab active:cursor-grabbing ${
                                  snapshot.isDragging ? "shadow-xl border-emerald-500 scale-102" : ""
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-start gap-2">
                                    <button 
                                      onClick={() => toggleComplete(task)}
                                      className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition ${
                                        task.completed 
                                          ? "bg-emerald-500 border-emerald-500 text-white" 
                                          : "border-gray-300 dark:border-slate-600 text-transparent"
                                      }`}
                                    >
                                      <CheckSquare size={10} strokeWidth={4} />
                                    </button>
                                    <h4 className={`font-semibold text-sm text-gray-900 dark:text-white leading-tight ${task.completed ? "line-through text-gray-400 dark:text-slate-500" : ""}`}>
                                      {task.title}
                                    </h4>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                    <button 
                                      onClick={() => openEdit(task)}
                                      className="p-1 text-gray-500 hover:text-cyan-500 rounded"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button 
                                      onClick={() => setDeleteDialog({ isOpen: true, id: task.id })}
                                      className="p-1 text-gray-500 hover:text-red-500 rounded"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>

                                {task.description && (
                                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/50 flex justify-between items-center text-xs">
                                  <div className={`flex items-center gap-1 ${isOverdue(task.due_date) && !task.completed ? "text-red-500 font-medium" : "text-gray-400"}`}>
                                    <Calendar size={12} />
                                    <span>{formatDate(task.due_date)}</span>
                                  </div>
                                  <StatusBadge status={task.priority} />
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

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Tasks;