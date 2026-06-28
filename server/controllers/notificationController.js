import { sql } from "../db/index.js";

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await sql`
      SELECT * FROM notifications 
      WHERE user_id = ${req.user.id} 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    res.json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const [updated] = await sql`
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE id = ${req.params.id} AND user_id = ${req.user.id}
      RETURNING *
    `;
    
    if (!updated) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllRead = async (req, res) => {
  try {
    await sql`
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE user_id = ${req.user.id}
    `;
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all read:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const [deleted] = await sql`
      DELETE FROM notifications 
      WHERE id = ${req.params.id} AND user_id = ${req.user.id}
      RETURNING id
    `;
    
    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};
