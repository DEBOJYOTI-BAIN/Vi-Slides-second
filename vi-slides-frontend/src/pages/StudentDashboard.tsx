import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [typedCode, setTypedCode] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/');
    } else {
      const user = JSON.parse(savedUser);
      setStudentName(user.name);
    }
  }, [navigate]);

  const handleJoinSession = async () => {
    if (typedCode.length !== 6) {
      alert("Enter 6-digit code");
      return;
    }
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sessions/join/${typedCode}`);
      localStorage.setItem('activeSession', JSON.stringify(res.data.session));
      navigate(`/session/${typedCode}`);
    } catch (error) {
      alert("Invalid Code");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0, color: '#2196F3' }}>Student Portal</h2>
        <button className="btn-3d btn-logout" onClick={() => { localStorage.removeItem('user'); navigate('/'); }}>Sign Out</button>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center', width: '500px' }}>
          <h1 style={{ color: '#333' }}>Hello, {studentName}!</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>Enter the session code from your teacher:</p>
          
          <input 
            type="text" 
            placeholder="000 000" 
            value={typedCode}
            onChange={(e) => setTypedCode(e.target.value)}
            style={{ width: '100%', padding: '15px', fontSize: '32px', textAlign: 'center', borderRadius: '10px', border: '2px solid #ddd', marginBottom: '30px', letterSpacing: '5px' }}
          />
          
          <button className="btn-3d btn-student" style={{ width: '100%', fontSize: '22px' }} onClick={handleJoinSession}>
            Join Classroom
          </button>
        </div>
      </main>
    </div>
  );
}