import mongoose from 'mongoose'

const lessonSchema = new mongoose.Schema({
  resourceId: { type: String, required: true },
  resourceType: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  timeSpent: { type: Number, default: 0 },
  score: { type: Number, default: null }
}, { _id: false })

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  subject: { type: String, required: true },
  grade: { type: String, default: 'N/A' },
  isActive: { type: Boolean, default: true },
  lessons: { type: [lessonSchema], default: [] },
  totalLessons: { type: Number, default: 0 },
  completedLessons: { type: Number, default: 0 },
  overallProgress: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 }
}, { _id: false })

const progressSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  courses: { type: [courseSchema], default: [] },
  streak: {
    current: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: null }
  }
}, { timestamps: true })

export default mongoose.models.Progress || mongoose.model('Progress', progressSchema)