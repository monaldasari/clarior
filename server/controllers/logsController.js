import { sql } from "../db/index.js";

export const getActivityLogs = async (req, res) => {
  try {
    const logs = await sql`
      SELECT a.*, u.full_name as user_name 
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC 
      LIMIT 50
    `;
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
