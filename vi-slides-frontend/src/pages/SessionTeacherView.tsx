import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SessionTeacherView() {
  const { code } = useParams();
  const navigate = useNavigate();

  const endSession = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/end/${code}`);
      navigate('/teacher');
    } catch (err) { alert("Error"); }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <header className="navbar">
        <button className="btn-3d btn-student" onClick={() => navigate('/teacher')}>← Lobby</button>
        <h2 style={{fontWeight: 300, letterSpacing: '2px'}}>LIVE SESSION</h2>
        <button className="btn-3d btn-logout" onClick={endSession}>Terminate 🛑</button>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{maxWidth: '900px'}}>
          <p style={{color: '#aaa', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '3px'}}>Access Key</p>
          <h1 className="join-code-text">{code}</h1>
          
          <div style={{marginTop: '30px', padding: '20px', background: 'rgba(0,210,255,0.1)', borderRadius: '15px', color: '#00d2ff'}}>
             <strong>Awaiting student interaction...</strong>
          </div>
        </div>
      </main>
    </div>
  );
}