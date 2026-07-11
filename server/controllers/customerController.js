import { sql } from "../db/index.js";
import { logActivity } from "../utils/logger.js";

export const getCustomers = async (req, res) => {
  try {
    const { search = "", status = "All", page = 1, limit = 10, sortBy = "created_at", sortOrder = "DESC" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    // Strict validation to prevent SQL injection on dynamic column names
    const allowedSortColumns = ["id", "name", "email", "company", "status", "created_at"];
    const finalSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const finalSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    let query = `SELECT * FROM customers`;
    let countQuery = `SELECT COUNT(*) as count FROM customers`;
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length} OR company ILIKE $${params.length})`);
    }

    if (status !== "All") {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (conditions.length > 0) {
      const condString = conditions.join(" AND ");
      query += ` WHERE ${condString}`;
      countQuery += ` WHERE ${condString}`;
    }

    // Safely append pre-validated order-by clauses
    query += ` ORDER BY ${finalSortBy} ${finalSortOrder}`;

    // Add pagination limit and offset parameters
    params.push(lim);
    query += ` LIMIT $${params.length}`;
    
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const customers = await sql.query(query, params);
    const [countResult] = await sql.query(countQuery, params.slice(0, params.length - 2));

    const total = parseInt(countResult.count || 0);
    res.json({ data: customers, total, page: parseInt(page), limit: lim, totalPages: Math.ceil(total / lim) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const [customer] = await sql`SELECT * FROM customers WHERE id = ${req.params.id}`;
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, status = "Active", tags = "" } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

    const [result] = await sql`
      INSERT INTO customers (name, email, phone, company, status, tags, created_by)
      VALUES (${name}, ${email}, ${phone || null}, ${company || null}, ${status}, ${tags}, ${req.user.id})
      RETURNING *
    `;
    await logActivity("customer_added", `New customer "${name}" was added`, "customer", result.id, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    if (err.message?.includes("unique") || err.message?.includes("duplicate"))
      return res.status(400).json({ error: "A customer with this email already exists" });
    res.status(500).json({ error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, status, tags = "" } = req.body;
    const [result] = await sql`
      UPDATE customers
      SET name=${name}, email=${email}, phone=${phone||null}, company=${company||null}, status=${status}, tags=${tags}
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    if (!result) return res.status(404).json({ error: "Customer not found" });
    await logActivity("customer_updated", `Customer "${name}" was updated`, "customer", result.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM customers WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: "Customer not found" });
    await logActivity("customer_deleted", `Customer "${deleted.name}" was deleted`, "customer", deleted.id, req.user.id);
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await sql`
      SELECT n.*, u.full_name as user_name 
      FROM customer_notes n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.customer_id = ${parseInt(id)}
      ORDER BY n.created_at DESC
    `;
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCustomerNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    if (!note) return res.status(400).json({ error: "Note content is required" });

    const [customer] = await sql`SELECT name FROM customers WHERE id = ${parseInt(id)}`;
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const [result] = await sql`
      INSERT INTO customer_notes (customer_id, note, created_by)
      VALUES (${parseInt(id)}, ${note}, ${req.user.id})
      RETURNING *
    `;

    result.user_name = req.user.full_name || "You";

    await logActivity("customer_note_added", `Added note to customer "${customer.name}"`, "customer", parseInt(id), req.user.id);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCustomerNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    
    const [customer] = await sql`SELECT name FROM customers WHERE id = ${parseInt(id)}`;
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const [deleted] = await sql`
      DELETE FROM customer_notes 
      WHERE id = ${parseInt(noteId)} AND customer_id = ${parseInt(id)}
      RETURNING *
    `;
    if (!deleted) return res.status(404).json({ error: "Note not found" });

    await logActivity("customer_note_deleted", `Deleted note from customer "${customer.name}"`, "customer", parseInt(id), req.user.id);
    res.json({ message: "Note deleted successfully", note: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
