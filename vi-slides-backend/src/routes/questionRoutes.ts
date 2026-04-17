import express from 'express';
import { Question } from '../models/Question.js';
import { Session } from '../models/Session.js';

const router = express.Router();

// Get all questions for a session
router.get('/:sessionCode', async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const session = await Session.findOne({ sessionCode });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const questions = await Question.find({ sessionId: session._id }).sort({ createdAt: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions" });
  }
});

// Submit a new question
router.post('/submit', async (req, res) => {
  try {
    const { sessionCode, studentId, text } = req.body;
    const session = await Session.findOne({ sessionCode });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status === 'paused') {
      return res.status(403).json({ message: "Session is paused. Questions cannot be submitted." });
    }

    const newQuestion = await Question.create({
      sessionId: session._id,
      studentId,
      text
    });

    res.json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error submitting question" });
  }
});

// Update a question (Student editing OR Teacher responding)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, teacherResponse, isAnswered } = req.body;
    
    let updateData: any = { text, teacherResponse, isAnswered };
    
    // Logic: If student edits text, reset the teacher response
    if (text) {
      updateData.teacherResponse = "";
      updateData.isAnswered = false;
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedQuestion) return res.status(404).json({ message: "Question not found" });
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error updating question" });
  }
});

// Delete a question
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Question.findByIdAndDelete(id);
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting question" });
  }
});

export default router;