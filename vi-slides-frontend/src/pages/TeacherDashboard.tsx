import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) navigate('/');
    setName(user.name);
  }, [navigate]);

  const handleStart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/create`, { teacherId: user._id });
      navigate(`/teacher-session/${res.data.sessionCode}`);
    } catch (err) { alert("Server Error"); }
  };

  return (
    <div className="full-page">
      <header className="navbar">
        <h2 style={{fontWeight: 900, color: '#00d2ff'}}>PROFESSOR</h2>
        <button className="btn-3d btn-logout" style={{width: 'auto', padding: '10px 20px'}} onClick={() => {localStorage.clear(); navigate('/')}}>Logout</button>
      </header>
      
      <main className="centered-container">
        
        <div className="glass-card">
          <h1 style={{fontSize: '32px', marginBottom: '10px'}}>Welcome, {name}</h1>
          <p style={{color: '#aaa', marginBottom: '40px', fontSize: '14px'}}>Start the session to lead the adaptive class</p>
          
          <button className="btn-3d btn-teacher btn-compact" onClick={handleStart}>
            + Start New Session
          </button>
        </div>
      </main>
    </div>
  );
}