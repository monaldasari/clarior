import { sql } from "../db/index.js";
import { logActivity } from "../utils/logger.js";

export const getCustomers = async (req, res) => {
  try {
    const { search = "", status = "All", page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    let customers, countResult;

    if (search && status !== "All") {
      const pattern = `%${search}%`;
      customers = await sql`
        SELECT * FROM customers
        WHERE (name ILIKE ${pattern} OR email ILIKE ${pattern} OR company ILIKE ${pattern})
          AND status = ${status}
        ORDER BY id DESC LIMIT ${lim} OFFSET ${offset}
      `;
      [countResult] = await sql`
        SELECT COUNT(*) as count FROM customers
        WHERE (name ILIKE ${pattern} OR email ILIKE ${pattern} OR company ILIKE ${pattern})
          AND status = ${status}
      `;
    } else if (search) {
      const pattern = `%${search}%`;
      customers = await sql`
        SELECT * FROM customers
        WHERE name ILIKE ${pattern} OR email ILIKE ${pattern} OR company ILIKE ${pattern}
        ORDER BY id DESC LIMIT ${lim} OFFSET ${offset}
      `;
      [countResult] = await sql`
        SELECT COUNT(*) as count FROM customers
        WHERE name ILIKE ${pattern} OR email ILIKE ${pattern} OR company ILIKE ${pattern}
      `;
    } else if (status !== "All") {
      customers = await sql`
        SELECT * FROM customers WHERE status = ${status}
        ORDER BY id DESC LIMIT ${lim} OFFSET ${offset}
      `;
      [countResult] = await sql`SELECT COUNT(*) as count FROM customers WHERE status = ${status}`;
    } else {
      customers = await sql`SELECT * FROM customers ORDER BY id DESC LIMIT ${lim} OFFSET ${offset}`;
      [countResult] = await sql`SELECT COUNT(*) as count FROM customers`;
    }

    const total = parseInt(countResult.count);
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
    const { name, email, phone, company, status = "Active" } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

    const [result] = await sql`
      INSERT INTO customers (name, email, phone, company, status, created_by)
      VALUES (${name}, ${email}, ${phone || null}, ${company || null}, ${status}, ${req.user.id})
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
    const { name, email, phone, company, status } = req.body;
    const [result] = await sql`
      UPDATE customers
      SET name=${name}, email=${email}, phone=${phone||null}, company=${company||null}, status=${status}
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
