import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [showRoles, setShowRoles] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    }
  }, [navigate]);

  const handleGoogleSuccess = async (response: any) => {
    setGoogleToken(response.credential);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google-login`, { token: response.credential });
      if (res.data.isNewUser) setShowRoles(true);
      else {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(res.data.user.role === 'teacher' ? '/teacher' : '/student');
      }
    } catch (err) { alert("Login connection failed"); }
  };

  const finishLogin = async (role: 'teacher' | 'student') => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google-login`, { token: googleToken, role });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate(role === 'teacher' ? '/teacher' : '/student');
    } catch (err) { alert("Error saving role"); }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '350px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', color: '#333' }}>Vi-SlideS</h1>
        <p style={{ color: '#666', marginBottom: '40px' }}>AI Adaptive Classroom</p>

        {!showRoles ? (
          <div className="google-btn-wrapper">
             <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => {}} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ color: '#444' }}>Select Role</h2>
            <button className="btn-3d btn-teacher" onClick={() => finishLogin('teacher')}>I am a Teacher</button>
            <button className="btn-3d btn-student" onClick={() => finishLogin('student')}>I am a Student</button>
          </div>
        )}
      </div>
    </div>
  );
}