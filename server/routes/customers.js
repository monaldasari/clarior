import express from "express";
import { 
  getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer 
} from "../controllers/customerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All customer routes are protected

router.route("/")
  .get(getCustomers)
  .post(authorize("Super Admin", "Admin", "Manager", "Employee"), createCustomer);

router.route("/:id")
  .get(getCustomer)
  .put(authorize("Super Admin", "Admin", "Manager", "Employee"), updateCustomer)
  .delete(authorize("Super Admin", "Admin", "Manager"), deleteCustomer);

export default router;
