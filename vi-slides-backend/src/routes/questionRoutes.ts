import express from 'express';
import { Question } from '../models/Question.js';
import { Session } from '../models/Session.js';

const router = express.Router();


router.get('/:sessionCode', async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const session = await Session.findOne({ sessionCode });
    if (!session) return res.status(404).json({ message: "Session not found" });
    const questions = await Question.find({ sessionId: session._id }).sort({ createdAt: 1 });
    res.json(questions);
  } catch (error) { res.status(500).json({ message: "Error" }); }
});


router.post('/submit', async (req, res) => {
  try {
    const { sessionCode, studentId, studentName, text } = req.body;
    const session = await Session.findOne({ sessionCode });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const newQuestion = await Question.create({
      sessionId: session._id,
      studentId,
      studentName: studentName || "Student", 
      text
    });
    res.json(newQuestion);
  } catch (error) { res.status(500).json({ message: "Submit failed" }); }
});


router.put('/:id', async (req, res) => {
  try {
    const { teacherResponse, isAnswered } = req.body;
    const updated = await Question.findByIdAndUpdate(
      req.params.id, { teacherResponse, isAnswered }, { new: true }
    );
    res.json(updated);
  } catch (error) { res.status(500).json({ message: "Update failed" }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) return res.status(404).json({ message: "Question not found" });
    
    res.json({ message: "Question deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;