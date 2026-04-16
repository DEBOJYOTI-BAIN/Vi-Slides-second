import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) navigate('/');
    setName(user.name);
  }, [navigate]);

  const handleJoin = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sessions/join/${code}`);
      localStorage.setItem('activeSession', JSON.stringify(res.data.session));
      navigate(`/session/${code}`);
    } catch (err) { alert("Invalid Code"); }
  };

  return (
    <div className="full-page">
      <header className="navbar">
        <h2 style={{fontWeight: 900, color: '#6c5ce7'}}>STUDENT</h2>
        <button className="btn-3d btn-logout" onClick={() => {localStorage.clear(); navigate('/')}}>Logout</button>
      </header>
      <main className="centered-container">
        <div className="glass-card">
          <h1>Hello, {name}</h1>
          <p style={{color: '#aaa', marginBottom: '30px'}}>Enter the 6-digit access key provided by your teacher.</p>
          
          <input 
            type="text" 
            placeholder="000 000" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            style={{textAlign: 'center', fontSize: '30px', letterSpacing: '10px'}}
          />
          
          <button className="btn-3d btn-student" style={{width: '100%'}} onClick={handleJoin}>
            Enter Classroom
          </button>
        </div>
      </main>
    </div>
  );
}