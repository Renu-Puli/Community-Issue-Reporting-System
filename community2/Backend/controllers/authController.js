import User from "../models/User.js";
import Worker from "../models/Worker.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= REGISTER =================
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, profession } = req.body;

        if (role === "admin" || email === "renupuli@gmail.com") {
            return res.status(400).json({ message: "Cannot register as an admin" });
        }

        const userExists = await User.findOne({ email });
        const workerExists = await Worker.findOne({ email });

        if (userExists || workerExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === "worker") {
            await Worker.create({
                name,
                email,
                password: hashedPassword,
                role: "worker",
                profession: profession || ""
            });
        } else {
            await User.create({
                name,
                email,
                password: hashedPassword,
                role: "user"
            });
        }

        res.status(201).json({ message: "User Registered Successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hardcoded Admin Logic
        if (email === "renupuli@gmail.com") {
            if (password === "12345678") {
                const token = jwt.sign(
                    { id: "admin", role: "admin" },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );
                return res.json({
                    token,
                    user: {
                        id: "admin",
                        name: "renu",
                        email: "renupuli@gmail.com",
                        role: "admin"
                    }
                });
            } else {
                return res.status(400).json({ message: "Invalid Credentials" });
            }
        }

        let user = await User.findOne({ email });
        let isWorker = false;

        if (!user) {
            user = await Worker.findOne({ email });
            isWorker = true;
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                ...(isWorker && { profession: user.profession })
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ================= UPDATE PROFESSION =================
export const updateProfession = async (req, res) => {
    try {
        const { profession } = req.body;

        const worker = await Worker.findById(req.user.id);
        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        worker.profession = profession;
        await worker.save();

        res.json({ message: "Profession updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ================= GET WORKERS (Admin Only) =================
export const getWorkers = async (req, res) => {
    try {
        const workers = await Worker.find({}).select("-password");
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};