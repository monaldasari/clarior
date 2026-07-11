import express from "express";
import { getCustomerAIAssist } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/customers/:id/ai-assist", protect, getCustomerAIAssist);

export default router;
