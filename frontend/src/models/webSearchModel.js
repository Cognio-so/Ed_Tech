import mongoose from "mongoose";

const webSearchSchema = new mongoose.Schema({
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
    contentType: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        default: 'English',
    },
    comprehension: {
        type: String,
        default: 'intermediate',
    },
    maxResults: {
        type: Number,
        default: 10,
    },
    query: {
        type: String,
        required: true,
    },
    searchResults: {
        type: String,
        required: true,
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

export default mongoose.models.WebSearch || mongoose.model("WebSearch", webSearchSchema);
