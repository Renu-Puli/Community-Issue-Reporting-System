import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getWorkerComplaints,
  updateComplaint,
  assignProfession,
  pickWork,
  completeWork,
  addFeedback,
} from "../controllers/complaintController.js";
import { protect, adminOnly, workerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ====== USER ROUTES ======
router.post("/", protect, createComplaint);
router.get("/my", protect, getMyComplaints);
router.post("/:id/feedback", protect, addFeedback);

// ====== WORKER ROUTES ======
router.get("/worker", protect, workerOnly, getWorkerComplaints);
router.patch("/:id/pick", protect, workerOnly, pickWork);
router.patch("/:id/complete", protect, workerOnly, completeWork);

// ====== ADMIN ROUTES ======
router.get("/", protect, adminOnly, getAllComplaints);
router.patch("/:id", protect, adminOnly, updateComplaint);
router.patch("/:id/assign-profession", protect, adminOnly, assignProfession);

export default router;
