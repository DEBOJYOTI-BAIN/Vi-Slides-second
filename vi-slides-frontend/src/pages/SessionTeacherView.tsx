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
    <div className="full-screen">
      <header className="navbar">
        <button className="btn-3d btn-student" onClick={() => navigate('/teacher')}>← Dashboard</button>
        <h2>Classroom Live</h2>
        <button className="btn-3d btn-logout" onClick={endSession}>End Class 🛑</button>
      </header>

      <main className="centered-content" style={{flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '40px'}}>
        <div className="glass-card" style={{maxWidth: '800px'}}>
          <p style={{color: '#666', margin: 0}}>Student Join Code:</p>
          <h1 className="join-code" style={{fontSize: '80px', margin: '10px 0'}}>{code}</h1>
          
          {/* NEW SECTION: THE QUESTION FEED */}
          <div className="question-area">
            <h3 style={{marginTop: 0, color: '#333'}}>Real-time Questions:</h3>
            <div className="question-card-mini">
              <p style={{margin: 0, color: '#888', fontStyle: 'italic'}}>Waiting for students to ask questions...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}