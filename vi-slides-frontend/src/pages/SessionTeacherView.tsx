import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SessionTeacherView() {
  const { code } = useParams(); // Logic: Grabs the code from URL
  const navigate = useNavigate();

  const endSession = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/end/${code}`);
      navigate('/teacher');
    } catch (err) { alert("Error ending session"); }
  };

  return (
    <div className="full-screen">
      <header className="navbar">
        <button className="btn-3d btn-student" onClick={() => navigate('/teacher')}>← Dashboard</button>
        <h2>Live Classroom</h2>
        <button className="btn-3d btn-logout" onClick={endSession}>End Session 🛑</button>
      </header>

      <main className="centered-content">
        <div className="glass-card">
          <p style={{fontSize: '24px', color: '#666'}}>Student Join Code:</p>
          <h1 className="join-code">{code}</h1>
          <p style={{color: '#999'}}>Project this screen for your students.</p>
        </div>
      </main>
    </div>
  );
}