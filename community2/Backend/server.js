import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import "./models/User.js";
import "./models/Complaint.js";
import "./models/Worker.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: [
 "http://localhost:5173",
 "http://localhost:8080",
 "http://localhost:3000",
 "https://community-issue-reporting-system-inky.vercel.app"
],
    credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

app.get("/", (req, res) => {
    res.send("Backend Working ✅");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);
