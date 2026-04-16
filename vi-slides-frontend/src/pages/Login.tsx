import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [showRoles, setShowRoles] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) navigate(user.role === 'teacher' ? '/teacher' : '/student');
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
    } catch (err) { alert("Login Fail"); }
  };

  const finishLogin = async (role: 'teacher' | 'student') => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google-login`, { token: googleToken, role });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate(role === 'teacher' ? '/teacher' : '/student');
    } catch (err) { alert("Error"); }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card">
        <h1 style={{fontSize: '50px', fontWeight: 900, marginBottom: '0'}}>VI-SLIDES</h1>
        <p style={{color: '#00d2ff', letterSpacing: '4px', marginBottom: '40px'}}>ADAPTIVE LEARNING</p>

        {!showRoles ? (
          <div style={{display: 'flex', justifyContent: 'center', background: 'white', padding: '10px', borderRadius: '15px'}} >
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => {}} />
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
            <h3 style={{fontWeight: 300}}>Establish Identity</h3>
            <button className="btn-3d btn-teacher" onClick={() => finishLogin('teacher')}>Professor</button>
            <button className="btn-3d btn-student" onClick={() => finishLogin('student')}>Student</button>
          </div>
        )}
      </div>
    </div>
  );
}