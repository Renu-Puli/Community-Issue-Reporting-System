import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            default: "Pending", // Pending → Assigned → In Progress → Completed → Closed
        },

        priority: {
            type: String,
            default: "Medium",
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        assignedProfession: {
            type: String,
        },

        assignedWorker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
        },

        proofImage: {
            type: String,
        },

        issueImage: {
            type: String,
        },

        remarks: {
            type: String,
            default: "",
        },

        feedback: {
            rating: { type: Number, min: 1, max: 5 },
            comment: { type: String }
        },
    },
    { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);