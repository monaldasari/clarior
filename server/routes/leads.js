import express from "express";
import { 
  getLeads, getLead, createLead, updateLead, deleteLead, updateLeadStatusBatch
} from "../controllers/leadController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected

router.route("/")
  .get(getLeads)
  .post(authorize("Super Admin", "Admin", "Manager", "Employee"), createLead);

router.post("/batch-status", authorize("Super Admin", "Admin", "Manager", "Employee"), updateLeadStatusBatch);

router.route("/:id")
  .get(getLead)
  .put(authorize("Super Admin", "Admin", "Manager", "Employee"), updateLead)
  .delete(authorize("Super Admin", "Admin", "Manager"), deleteLead);

export default router;
