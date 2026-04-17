import express from 'express';
import { Session } from '../models/Session.js';

const router = express.Router();


const generateSessionCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


router.post('/create', async (req, res) => {
  try {
    const { teacherId } = req.body;
    const sessionCode = generateSessionCode();
    const newSession = await Session.create({
      sessionCode,
      teacherId,
      status: 'active'
    });
    res.json(newSession);
  } catch (error) {
    res.status(500).json({ message: "Failed to create session" });
  }
});


router.get('/join/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const session = await Session.findOne({ sessionCode: code });

    if (!session) {
      return res.status(404).json({ message: "Session code not found. Please check and try again." });
    }

    if (session.status === 'ended') {
      return res.status(400).json({ message: "This session has already ended and is no longer available." });
    }

    // Students can join active or paused sessions
    res.json({ message: "Joined successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Server error joining session" });
  }
});


router.post('/end/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const session = await Session.findOneAndUpdate(
      { sessionCode: code },
      { status: 'ended' },
      { new: true }
    );

    if (!session) return res.status(404).json({ message: "Session not found" });

    console.log(`Session Ended: ${code}`);
    res.json({ message: "Session ended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error ending session" });
  }
});

router.post('/pause/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const session = await Session.findOneAndUpdate(
      { sessionCode: code },
      { status: 'paused' },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session paused", session });
  } catch (error) {
    res.status(500).json({ message: "Error pausing session" });
  }
});

router.post('/resume/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const session = await Session.findOneAndUpdate(
      { sessionCode: code },
      { status: 'active' },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session resumed", session });
  } catch (error) {
    res.status(500).json({ message: "Error resuming session" });
  }
});

export default router;