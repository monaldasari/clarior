import express from "express";
import { 
  getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer,
  getCustomerNotes, createCustomerNote, deleteCustomerNote
} from "../controllers/customerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateCustomer, validateNote } from "../middleware/validate.js";

const router = express.Router();

router.use(protect); // All customer routes are protected

router.route("/")
  .get(getCustomers)
  .post(authorize("Super Admin", "Admin", "Manager", "Employee"), validateCustomer, createCustomer);

router.route("/:id")
  .get(getCustomer)
  .put(authorize("Super Admin", "Admin", "Manager", "Employee"), validateCustomer, updateCustomer)
  .delete(authorize("Super Admin", "Admin", "Manager"), deleteCustomer);

router.route("/:id/notes")
  .get(getCustomerNotes)
  .post(authorize("Super Admin", "Admin", "Manager", "Employee"), validateNote, createCustomerNote);

router.route("/:id/notes/:noteId")
  .delete(authorize("Super Admin", "Admin", "Manager"), deleteCustomerNote);

export default router;
