import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    gradeLevel: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    visualType: {
        type: String,
        required: true,
    },
    instructions: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    difficultyFlag: {
        type: String,
        default: 'false',
    },
    status: {
        type: String,
        default: 'success',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

export default mongoose.models.Image || mongoose.model("Image", imageSchema);