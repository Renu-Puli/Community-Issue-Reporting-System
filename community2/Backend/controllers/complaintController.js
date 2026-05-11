import Complaint from "../models/Complaint.js";

// ✅ Create Complaint (User)
export const createComplaint = async (req, res) => {
    try {
        const { title, description, category, location, issueImage } = req.body;

        const complaint = await Complaint.create({
            title,
            description,
            category,
            location,
            issueImage,
            user: req.user.id,
        });

        res.status(201).json(complaint);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get All Complaints (Admin)
export const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("user", "name email")
            .populate("assignedWorker", "name email profession")
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get My Complaints (User)
export const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get Worker's Assigned Complaints (Worker)
export const getWorkerComplaints = async (req, res) => {
    try {
        // Fetch complaints specifically assigned to this worker
        // OR assigned to their profession and NOT yet assigned to any specific worker
        const complaints = await Complaint.find({
            $or: [
                { assignedWorker: req.user.id },
                {
                    assignedProfession: req.user.profession,
                    assignedWorker: { $exists: false }
                },
                {
                    assignedProfession: req.user.profession,
                    assignedWorker: null
                }
            ]
        }).sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update Complaint (Admin) — status, priority, assignedWorker
export const updateComplaint = async (req, res) => {
    try {
        const { status, priority, assignedWorker, remarks } = req.body;

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (priority !== undefined) complaint.priority = priority;
        if (remarks !== undefined) complaint.remarks = remarks;

        // When assigning a worker, auto-set status to "Assigned"
        if (assignedWorker !== undefined) {
            let isDifferentWorker = false;
            
            if (assignedWorker === null || assignedWorker === "") {
                isDifferentWorker = !!complaint.assignedWorker;
            } else {
                isDifferentWorker = complaint.assignedWorker?.toString() !== assignedWorker.toString();
            }

            complaint.assignedWorker = assignedWorker || null;

            if (assignedWorker && (complaint.status === 'Pending' || (isDifferentWorker && complaint.status === 'In Progress'))) {
                complaint.status = 'Assigned';
            } else if (!assignedWorker) {
                complaint.status = 'Pending';
            }
        }
        // Allow explicit status override
        if (status !== undefined) complaint.status = status;

        const updated = await complaint.save();
        await updated.populate("user", "name email");
        await updated.populate("assignedWorker", "name email profession");

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Assign Profession (Admin)
export const assignProfession = async (req, res) => {
    try {
        const { profession } = req.body;

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        complaint.assignedProfession = profession;
        complaint.status = "Assigned";

        await complaint.save();
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Worker Picks Work
export const pickWork = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        // Only allow picking if it was assigned to this worker
        const workerId = req.user.id;
        const assignedId = complaint.assignedWorker?.toString();
        if (assignedId && assignedId !== workerId) {
            return res.status(403).json({ message: "This complaint is assigned to a different worker" });
        }

        complaint.assignedWorker = workerId;
        complaint.status = "In Progress";

        await complaint.save();
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Worker Updates / Completes Work
export const completeWork = async (req, res) => {
    try {
        const { proofImage, remarks, status } = req.body;

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (proofImage !== undefined) complaint.proofImage = proofImage;
        if (remarks !== undefined) complaint.remarks = remarks;
        if (status !== undefined) complaint.status = status;
        else complaint.status = "Completed";

        await complaint.save();
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ User adds feedback
export const addFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const complaint = await Complaint.findById(req.params.id);
        
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (complaint.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to add feedback for this complaint" });
        }

        if (complaint.status !== "Completed") {
            return res.status(400).json({ message: "Feedback can only be added to completed complaints" });
        }

        complaint.feedback = { rating, comment };
        await complaint.save();
        
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};