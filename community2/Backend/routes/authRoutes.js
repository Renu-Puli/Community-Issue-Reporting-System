import express from "express";
import {
    registerUser,
    loginUser,
    updateProfession,
    getWorkers
} from "../controllers/authController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= PUBLIC ROUTES =================
router.post("/register", registerUser);
router.post("/login", loginUser);

// ================= PROTECTED ROUTES =================
router.put("/update-profession", protect, updateProfession);

// ================= ADMIN ONLY ROUTES =================
router.get("/workers", protect, adminOnly, getWorkers);

export default router;