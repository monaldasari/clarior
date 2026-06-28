import { sql } from "../db/index.js";
import { logActivity } from "../utils/logger.js";

export const getLeads = async (req, res) => {
  try {
    const { search = "", status = "All", priority = "All", page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    let leads, countResult;

    if (search) {
      const pattern = `%${search}%`;
      leads = await sql`
        SELECT l.*, u.full_name as assigned_user_name 
        FROM leads l
        LEFT JOIN users u ON l.assigned_user_id = u.id
        WHERE l.name ILIKE ${pattern} OR l.email ILIKE ${pattern} OR l.company ILIKE ${pattern}
        ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${offset}
      `;
      [countResult] = await sql`
        SELECT COUNT(*) as count FROM leads
        WHERE name ILIKE ${pattern} OR email ILIKE ${pattern} OR company ILIKE ${pattern}
      `;
    } else if (status !== "All") {
      leads = await sql`
        SELECT l.*, u.full_name as assigned_user_name 
        FROM leads l
        LEFT JOIN users u ON l.assigned_user_id = u.id
        WHERE l.status=${status}
        ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${offset}
      `;
      [countResult] = await sql`SELECT COUNT(*) as count FROM leads WHERE status=${status}`;
    } else {
      leads = await sql`
        SELECT l.*, u.full_name as assigned_user_name 
        FROM leads l
        LEFT JOIN users u ON l.assigned_user_id = u.id
        ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${offset}
      `;
      [countResult] = await sql`SELECT COUNT(*) as count FROM leads`;
    }

    const total = parseInt(countResult.count);
    res.json({ data: leads, total, page: parseInt(page), limit: lim, totalPages: Math.ceil(total / lim) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLead = async (req, res) => {
  try {
    const [lead] = await sql`SELECT * FROM leads WHERE id=${req.params.id}`;
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, status, assigned_to, assigned_user_id, priority, notes } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const [result] = await sql`
      INSERT INTO leads (
        name, email, phone, company, source, status, 
        assigned_to, assigned_user_id, priority, notes, created_by
      )
      VALUES (
        ${name}, ${email||null}, ${phone||null}, ${company||null},
        ${source||"Website"}, ${status||"New"}, 
        ${assigned_to||null}, ${assigned_user_id||null},
        ${priority||"Medium"}, ${notes||null}, ${req.user.id}
      ) RETURNING *
    `;
    await logActivity("lead_added", `New lead "${name}" was added`, "lead", result.id, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, status, assigned_to, assigned_user_id, priority, notes } = req.body;
    const [result] = await sql`
      UPDATE leads SET
        name=${name}, email=${email||null}, phone=${phone||null}, company=${company||null},
        source=${source||"Website"}, status=${status||"New"}, 
        assigned_to=${assigned_to||null}, assigned_user_id=${assigned_user_id||null},
        priority=${priority||"Medium"}, notes=${notes||null}, updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *
    `;
    if (!result) return res.status(404).json({ error: "Lead not found" });
    await logActivity("lead_updated", `Lead "${name}" was updated`, "lead", result.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM leads WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: "Lead not found" });
    await logActivity("lead_deleted", `Lead "${deleted.name}" was deleted`, "lead", deleted.id, req.user.id);
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update multiple leads (useful for drag and drop Kanban)
export const updateLeadStatusBatch = async (req, res) => {
  try {
    const { leadId, newStatus } = req.body;
    const [result] = await sql`
      UPDATE leads SET status=${newStatus}, updated_at=NOW()
      WHERE id=${leadId} RETURNING *
    `;
    if (!result) return res.status(404).json({ error: "Lead not found" });
    await logActivity("lead_updated", `Lead "${result.name}" moved to ${newStatus}`, "lead", result.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
