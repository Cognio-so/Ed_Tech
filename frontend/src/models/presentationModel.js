import mongoose from "mongoose";

const presentationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    customInstructions: {
        type: String,
        default: '',
    },
    slideCount: {
        type: Number,
        required: true,
        min: 1,
        max: 50,
    },
    language: {
        type: String,
        default: 'ENGLISH',
        enum: ['ENGLISH', 'ARABIC'],
    },
    includeImages: {
        type: Boolean,
        default: true,
    },
    verbosity: {
        type: String,
        default: 'standard',
        enum: ['concise', 'standard', 'text-heavy'],
    },
    taskId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'PENDING',
        enum: ['PENDING', 'SUCCESS', 'FAILURE'],
    },
    presentationUrl: {
        type: String,
        default: null,
    },
    downloadUrl: {
        type: String,
        default: null,
    },
    apiResponse: {
        type: Object,
        default: null,
    },
    errorMessage: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

export default mongoose.models.presentation || mongoose.model("presentation", presentationSchema); 