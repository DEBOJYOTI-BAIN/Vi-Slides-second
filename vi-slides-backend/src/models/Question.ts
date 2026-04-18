import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String, default: "Anonymous" }, 
  text: { type: String, required: true },
  teacherResponse: { type: String, default: "" },
  isAnswered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Question = mongoose.model('Question', QuestionSchema);