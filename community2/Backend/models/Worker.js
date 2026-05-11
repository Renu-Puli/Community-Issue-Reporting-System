import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            default: "worker",
        },

        profession: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Worker", workerSchema);
