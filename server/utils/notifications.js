import { sql } from "../db/index.js";
import { sendRealtimeNotification } from "./websocket.js";

export const createNotification = async (userId, title, message, type = "Info", link = null) => {
  if (!userId) return null;
  try {
    const [notification] = await sql`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (${parseInt(userId)}, ${title}, ${message}, ${type}, ${link})
      RETURNING *
    `;
    
    // Dispatch in real-time if client is online
    sendRealtimeNotification(userId, notification);
    
    return notification;
  } catch (error) {
    console.error("Failed to create and push notification:", error);
    return null;
  }
};
