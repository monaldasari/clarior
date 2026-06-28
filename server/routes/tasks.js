import express from "express";
import { 
  getTasks, getTask, createTask, updateTask, deleteTask, updateTaskStatusBatch
} from "../controllers/taskController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected

router.route("/")
  .get(getTasks)
  .post(authorize("Super Admin", "Admin", "Manager", "Employee"), createTask);

router.post("/batch-status", authorize("Super Admin", "Admin", "Manager", "Employee"), updateTaskStatusBatch);

router.route("/:id")
  .get(getTask)
  .put(authorize("Super Admin", "Admin", "Manager", "Employee"), updateTask)
  .delete(authorize("Super Admin", "Admin", "Manager"), deleteTask);

export default router;
