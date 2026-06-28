import express from "express";
import { 
  getNotifications, 
  markAsRead, 
  markAllRead, 
  deleteNotification 
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All notification routes require authentication

router.get("/", getNotifications);
router.put("/read-all", markAllRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
