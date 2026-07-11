import { sql } from "../db/index.js";

export const getActivityLogs = async (req, res) => {
  try {
    const { entity_type, entity_id } = req.query;
    let logs;
    
    if (entity_type && entity_id) {
      logs = await sql`
        SELECT a.*, u.full_name as user_name 
        FROM activity_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.entity_type = ${entity_type} AND a.entity_id = ${parseInt(entity_id)}
        ORDER BY a.created_at DESC 
        LIMIT 50
      `;
    } else {
      logs = await sql`
        SELECT a.*, u.full_name as user_name 
        FROM activity_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC 
        LIMIT 50
      `;
    }
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
