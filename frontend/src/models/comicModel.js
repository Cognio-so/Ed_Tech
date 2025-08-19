import mongoose from "mongoose";

const panelSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    prompt: { type: String, default: "" },
    imageUrl: { type: String, required: true },
  },
  { _id: false }
);

const comicSchema = new mongoose.Schema(
  {
    clerkId: {
        type: String,
        required: true,
    },
    instructions: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    numPanels: { type: Number, required: true },
    language: { type: String, default: "English" }, // Add language field
    panels: { type: [panelSchema], default: [] },
    images: { type: [String], default: [] }, // quick access to panel URLs
    status: { type: String, default: "success" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Comic || mongoose.model("Comic", comicSchema);
