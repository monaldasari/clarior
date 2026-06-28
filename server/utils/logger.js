import { sql } from "../db/index.js";

export const logActivity = async (type, message, entity_type = null, entity_id = null, user_id = null) => {
  try {
    await sql`
      INSERT INTO activity_logs (type, message, entity_type, entity_id, user_id)
      VALUES (${type}, ${message}, ${entity_type}, ${entity_id}, ${user_id})
    `;
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
