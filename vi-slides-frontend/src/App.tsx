import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SessionTeacherView from './pages/SessionTeacherView';
import SessionStudentView from './pages/SessionStudentView';

export default function App() {
  const [googleId, setGoogleId] = useState<string | null>(null);

  useEffect(() => {
    
    axios.get(`${import.meta.env.VITE_API_URL}/api/config/google-id`)
      .then(res => {
        setGoogleId(res.data.clientId);
      })
      .catch(err => {
        console.error("FATAL: Could not load Google Configuration", err);
      });
  }, []);

  
  if (!googleId) {
    return (
      <div className="full-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1b' }}>
        <h1 style={{ color: '#00d2ff', fontFamily: 'Poppins' }}>Initializing Systems...</h1>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher-session/:code" element={<SessionTeacherView />} />
          <Route path="/session/:code" element={<SessionStudentView />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}