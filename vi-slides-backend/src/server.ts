import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js'; 
import sessionRoutes from './routes/sessionRoutes.js'; 
import questionRoutes from './routes/questionRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes); 
app.use('/api/questions', questionRoutes);

const mongoURI = process.env.MONGO_URI || "";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-session', (sessionCode) => {
    socket.join(sessionCode);
    console.log(`User ${socket.id} joined session: ${sessionCode}`);
  });

  socket.on('new-question', (data) => {
    io.to(data.sessionCode).emit('question-added', data.question);
  });

  socket.on('update-question', (data) => {
    io.to(data.sessionCode).emit('question-updated', data.question);
  });

  socket.on('delete-question', (data) => {
    io.to(data.sessionCode).emit('question-deleted', data.questionId);
  });

  socket.on('change-session-status', (data) => {
    io.to(data.sessionCode).emit('session-status-changed', data.status);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send("Vi-SlideS Backend is Live and Healthy!");
});

const PORT = 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});