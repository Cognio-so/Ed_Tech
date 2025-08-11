import mongoose from "mongoose";

if (mongoose.models.WebSearch) {
    delete mongoose.models.WebSearch;
}

const webSearchSchema = new mongoose.Schema({
    clerkId: {
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

export default mongoose.model("WebSearch", webSearchSchema  )
