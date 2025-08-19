import mongoose from "mongoose";

if (mongoose.models.Image) {
  delete mongoose.models.Image;
}

const imageSchema = new mongoose.Schema({
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
    visualType: {
        type: String,
        required: true,
    },
    instructions: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        default: 'English',
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

export default mongoose.model("Image", imageSchema);