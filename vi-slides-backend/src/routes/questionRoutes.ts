import express from 'express';
import { Question } from '../models/Question.js';
import { Session } from '../models/Session.js';

const router = express.Router();

// GET ALL QUESTIONS
router.get('/:sessionCode', async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const session = await Session.findOne({ sessionCode });
    if (!session) return res.status(404).json({ message: "Session not found" });
    const questions = await Question.find({ sessionId: session._id }).sort({ createdAt: 1 });
    res.json(questions);
  } catch (error) { res.status(500).json({ message: "Error" }); }
});

// SUBMIT QUESTION (FIXED TO SAVE NAME)
router.post('/submit', async (req, res) => {
  try {
    const { sessionCode, studentId, studentName, text } = req.body;
    const session = await Session.findOne({ sessionCode });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const newQuestion = await Question.create({
      sessionId: session._id,
      studentId,
      studentName: studentName || "Student", // SAVES THE ACTUAL NAME
      text
    });
    res.json(newQuestion);
  } catch (error) { res.status(500).json({ message: "Submit failed" }); }
});

// UPDATE FOR RESPONSE
router.put('/:id', async (req, res) => {
  try {
    const { teacherResponse, isAnswered } = req.body;
    const updated = await Question.findByIdAndUpdate(
      req.params.id, { teacherResponse, isAnswered }, { new: true }
    );
    res.json(updated);
  } catch (error) { res.status(500).json({ message: "Update failed" }); }
});

export default router;