import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) navigate('/');
    setName(user.name);
    setId(user._id);
  }, [navigate]);

  const handleStart = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/create`, { teacherId: id });
      // LOGIC: Redirects to the specific session page using the new code
      navigate(`/teacher-session/${res.data.sessionCode}`);
    } catch (err) { alert("Server error"); }
  };

  return (
    <div className="full-screen">
      <header className="navbar">
        <h2>Teacher Portal</h2>
        <button className="btn-3d btn-logout" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
      </header>
      <main className="centered-content">
        <div className="glass-card">
          <h1>Welcome, {name}</h1>
          <p style={{marginBottom: '40px'}}>Click below to begin your adaptive session.</p>
          <button className="btn-3d btn-teacher" onClick={handleStart}>+ Start New Session</button>
        </div>
      </main>
    </div>
  );
}