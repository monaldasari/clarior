import express from "express";
import { 
  updateProfile, 
  getUsers, 
  createUser,
  updateUser, 
  deleteUser,
  uploadAvatar,
  changePassword
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../utils/upload.js";

const router = express.Router();

router.use(protect); // All routes require authentication

router.put("/me", updateProfile);
router.put("/change-password", changePassword);
router.post("/avatar", upload.single("avatar"), uploadAvatar);

// Admin-only routes
router.route("/")
  .get(authorize("Super Admin", "Admin"), getUsers)
  .post(authorize("Super Admin", "Admin"), createUser);

router.route("/:id")
  .put(authorize("Super Admin", "Admin"), updateUser)
  .delete(authorize("Super Admin", "Admin"), deleteUser);

export default router;
