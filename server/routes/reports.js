import express from "express";
import { getReportsOverview } from "../controllers/reportsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", protect, getReportsOverview);

export default router;
