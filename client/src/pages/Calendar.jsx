import { useEffect, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { taskService } from "../api/api";
import { useToast } from "../context/ToastContext";
import StatusBadge from "../components/ui/StatusBadge";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const Calendar = () => {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks({ limit: 500 });
      setTasks(res.data?.data || []);
    } catch (_err) {
      addToast("Failed to load tasks for calendar", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, inMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, inMonth: true, date: new Date(year, month, d) });
    }

    // Next month leading days to fill the grid (6 rows max)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, inMonth: false, date: new Date(year, month + 1, d) });
    }

    return days;
  }, [year, month]);

  // Map tasks to date keys
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (!task.due_date) return;
      const d = new Date(task.due_date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [tasks]);

  const today = new Date();
  const isToday = (date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const isSelected = (date) =>
    selectedDay &&
    date.getFullYear() === selectedDay.getFullYear() &&
    date.getMonth() === selectedDay.getMonth() &&
    date.getDate() === selectedDay.getDate();

  const getDateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-500";
      case "Medium": return "bg-amber-500";
      case "Low": return "bg-emerald-500";
      default: return "bg-slate-400";
    }
  };

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  };

  const selectedDayTasks = selectedDay ? (tasksByDate[getDateKey(selectedDay)] || []) : [];

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Grid */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                  <CalendarDays size={20} className="text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {MONTHS[month]} {year}
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {tasks.length} total tasks tracked
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={goToPrevMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700">
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${
                    i === 0 || i === 6
                      ? "text-gray-300 dark:text-slate-600"
                      : "text-gray-400 dark:text-slate-500"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            {loading ? (
              <div className="p-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                <div className="animate-pulse space-y-3">
                  {[1,2,3,4,5,6].map(r => (
                    <div key={r} className="grid grid-cols-7 gap-1">
                      {[1,2,3,4,5,6,7].map(c => (
                        <div key={c} className="h-16 bg-gray-100 dark:bg-slate-700/50 rounded-lg" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {calendarDays.map((cell, idx) => {
                  const key = getDateKey(cell.date);
                  const dayTasks = tasksByDate[key] || [];
                  const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;

                  return (
                    <button
                      key={idx}
                      onClick={() => cell.inMonth && setSelectedDay(cell.date)}
                      className={`relative min-h-[72px] sm:min-h-[84px] p-1.5 sm:p-2 border-b border-r border-gray-100 dark:border-slate-700/50 text-left transition-colors cursor-pointer ${
                        !cell.inMonth
                          ? "bg-gray-50/50 dark:bg-slate-900/30"
                          : isWeekend
                            ? "bg-gray-50/30 dark:bg-slate-800/50"
                            : "bg-white dark:bg-slate-800 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10"
                      } ${isSelected(cell.date) ? "!bg-cyan-50 dark:!bg-cyan-900/20 ring-2 ring-inset ring-cyan-400" : ""}`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                          isToday(cell.date)
                            ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                            : !cell.inMonth
                              ? "text-gray-300 dark:text-slate-600"
                              : "text-gray-700 dark:text-slate-300"
                        }`}
                      >
                        {cell.day}
                      </span>

                      {/* Task dots */}
                      {dayTasks.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {dayTasks.slice(0, 4).map((t, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(t.priority)}`}
                              title={t.title}
                            />
                          ))}
                          {dayTasks.length > 4 && (
                            <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold ml-0.5">
                              +{dayTasks.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel — Selected Day Tasks */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {selectedDay
                  ? selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                  : "Select a Day"}
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                {selectedDay ? `${selectedDayTasks.length} task${selectedDayTasks.length !== 1 ? "s" : ""} scheduled` : "Click on any date to see tasks"}
              </p>
            </div>

            <div className="p-4 max-h-[500px] overflow-y-auto">
              {!selectedDay ? (
                <div className="text-center py-10">
                  <CalendarDays size={36} className="mx-auto text-gray-200 dark:text-slate-700 mb-3" />
                  <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">
                    Click a date to view tasks
                  </p>
                </div>
              ) : selectedDayTasks.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-200 dark:text-emerald-900 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                    No tasks scheduled
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    This day is clear!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 hover:border-cyan-200 dark:hover:border-cyan-800 transition"
                    >
                      <div className="flex items-start gap-2.5">
                        {task.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Clock size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold leading-tight ${
                            task.completed
                              ? "line-through text-gray-400 dark:text-slate-500"
                              : "text-gray-900 dark:text-white"
                          }`}>
                            {task.title}
                          </p>
                          {task.assigned_user_name && (
                            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
                              Assigned to {task.assigned_user_name}
                            </p>
                          )}
                          <div className="flex gap-1.5 mt-2">
                            <StatusBadge status={task.priority} />
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
