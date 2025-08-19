import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    grade: {
        type: String,
        required: true,
    },
    emotionalFlags: {
        type: String,
        default: '',
    },
    adaptiveLevel: {
        type: Boolean,
        default: false,
    },
    includeAssessment: {
        type: Boolean,
        default: false,
    },
    multimediaSuggestions: {
        type: Boolean,
        default: false,
    },
    generateSlides: {
        type: Boolean,
        default: false,
    },
    instructionalDepth: {
        type: String,
        default: 'standard',
    },
    contentVersion: {
        type: String,
        default: 'standard',
    },
    contentType: {
        type: String,
        required: true,
    },
    objectives: {
        type: String,
        default: '',
    },
    language: {
        type: String,
        default: 'English',
    },
    generatedContent: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

export default mongoose.models.content || mongoose.model("content", contentSchema);