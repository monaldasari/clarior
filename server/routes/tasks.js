import express from "express";
import { 
  getTasks, getTask, createTask, updateTask, deleteTask, updateTaskStatusBatch
} from "../controllers/taskController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateTask } from "../middleware/validate.js";

const router = express.Router();

router.use(protect); // All routes protected

router.route("/")
  .get(getTasks)
  .post(authorize("Super Admin", "Admin", "Manager", "Employee"), validateTask, createTask);

router.post("/batch-status", authorize("Super Admin", "Admin", "Manager", "Employee"), updateTaskStatusBatch);

router.route("/:id")
  .get(getTask)
  .put(authorize("Super Admin", "Admin", "Manager", "Employee"), validateTask, updateTask)
  .delete(authorize("Super Admin", "Admin", "Manager"), deleteTask);

export default router;
