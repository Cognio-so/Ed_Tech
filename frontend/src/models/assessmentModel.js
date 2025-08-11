import mongoose from "mongoose";

if (mongoose.models.assessment) {
  delete mongoose.models.assessment;
}

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['mcq', 'true_false', 'short_answer', 'long_answer', 'diagram'] 
    },
    question: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
    },
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
    },
    points: {
        type: Number,
        default: 1,
    },
    rubric: {
        type: String,
    },
    diagramPrompt: {
        type: String,
    }
}, { _id: false });

const solutionSchema = new mongoose.Schema({
    questionNumber: {
        type: Number,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    }
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: [true, "Assessment title is required."],
        trim: true,
    },
    grade: { 
        type: String,
        required: [true, "Grade level is required."],
    },
    subject: {
        type: String,
        required: [true, "Subject is required."],
    },
    description: { 
        type: String,
        trim: true,
    },
    duration: { 
        type: Number,
        required: [true, "Duration is required."],
    },
    status: { 
        type: String,
        required: true,
        enum: ['draft', 'active', 'completed'],
        default: 'draft',
    },
    anxietyTriggers: { 
        type: [String],
    },
    questions: [questionSchema],
    solutions: [solutionSchema],
    rawContent: {
        type: String, // Store the original AI-generated content for reference
    }
}, { timestamps: true });

export default mongoose.model("assessment", assessmentSchema);
