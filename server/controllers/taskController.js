import { sql } from "../db/index.js";
import { logActivity } from "../utils/logger.js";

export const getTasks = async (req, res) => {
  try {
    const { search = "", status = "All", page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    let tasks, countResult;

    if (search) {
      const pattern = `%${search}%`;
      tasks = await sql`
        SELECT t.*, u.full_name as assigned_user_name 
        FROM tasks t
        LEFT JOIN users u ON t.assigned_user_id = u.id
        WHERE t.title ILIKE ${pattern} OR t.description ILIKE ${pattern}
        ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      [countResult] = await sql`
        SELECT COUNT(*) as count FROM tasks
        WHERE title ILIKE ${pattern} OR description ILIKE ${pattern}
      `;
    } else if (status !== "All") {
      tasks = await sql`
        SELECT t.*, u.full_name as assigned_user_name 
        FROM tasks t
        LEFT JOIN users u ON t.assigned_user_id = u.id
        WHERE t.status=${status}
        ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      [countResult] = await sql`SELECT COUNT(*) as count FROM tasks WHERE status=${status}`;
    } else {
      tasks = await sql`
        SELECT t.*, u.full_name as assigned_user_name 
        FROM tasks t
        LEFT JOIN users u ON t.assigned_user_id = u.id
        ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      [countResult] = await sql`SELECT COUNT(*) as count FROM tasks`;
    }

    const total = parseInt(countResult.count);
    res.json({ data: tasks, total, page: parseInt(page), limit: lim, totalPages: Math.ceil(total / lim) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const [task] = await sql`SELECT * FROM tasks WHERE id=${req.params.id}`;
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, assigned_user_id, priority, due_date, status, category } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const [result] = await sql`
      INSERT INTO tasks (
        title, description, assigned_to, assigned_user_id, 
        priority, due_date, status, category, created_by
      )
      VALUES (
        ${title}, ${description||null}, ${assigned_to||null}, ${assigned_user_id||null},
        ${priority||"Medium"}, ${due_date||null}, ${status||"Todo"}, ${category||"General"},
        ${req.user.id}
      ) RETURNING *
    `;
    await logActivity("task_added", `Task "${title}" was created`, "task", result.id, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, assigned_to, assigned_user_id, priority, due_date, completed, status, category } = req.body;
    const [result] = await sql`
      UPDATE tasks SET
        title=${title}, description=${description||null}, 
        assigned_to=${assigned_to||null}, assigned_user_id=${assigned_user_id||null},
        priority=${priority||"Medium"}, due_date=${due_date||null},
        completed=${completed||false}, status=${status||"Todo"}, 
        category=${category||"General"}, updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *
    `;
    if (!result) return res.status(404).json({ error: "Task not found" });
    
    const action = completed ? "task_completed" : "task_updated";
    const msg = completed ? `Task "${title}" was completed` : `Task "${title}" was updated`;
    await logActivity(action, msg, "task", result.id, req.user.id);
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM tasks WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: "Task not found" });
    await logActivity("task_deleted", `Task "${deleted.title}" was deleted`, "task", deleted.id, req.user.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTaskStatusBatch = async (req, res) => {
  try {
    const { taskId, newStatus } = req.body;
    const completed = newStatus === 'Done';
    const [result] = await sql`
      UPDATE tasks SET status=${newStatus}, completed=${completed}, updated_at=NOW()
      WHERE id=${taskId} RETURNING *
    `;
    if (!result) return res.status(404).json({ error: "Task not found" });
    
    const action = completed ? "task_completed" : "task_updated";
    const msg = `Task "${result.title}" moved to ${newStatus}`;
    await logActivity(action, msg, "task", result.id, req.user.id);
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
