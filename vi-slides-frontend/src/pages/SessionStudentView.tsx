import { useParams, useNavigate } from 'react-router-dom';

export default function SessionStudentView() {
  const { code } = useParams();
  const navigate = useNavigate();

  return (
    <div className="full-screen">
      <header className="navbar">
        <button className="btn-3d btn-logout" onClick={() => navigate('/student')}>Leave Class</button>
        <h2>Session: {code}</h2>
        <div style={{width: '100px'}}></div>
      </header>

      <main className="centered-content">
        <div className="glass-card">
          <h1 style={{color: '#4CAF50', margin: 0}}>Joined! ✅</h1>
          <p style={{color: '#666', marginBottom: '30px'}}>Type your question below for the teacher or AI.</p>
          
          {/* THE FIXED TEXTBOX */}
          <textarea placeholder="Ask something..." maxLength={250} />
          
          <button className="btn-3d btn-student" style={{width: '100%', marginTop: '20px'}}>
            Submit to AI Triage
          </button>

          <div style={{marginTop: '30px', textAlign: 'left'}}>
             <h4 style={{color: '#444', marginBottom: '10px'}}>Your Recent Questions:</h4>
             <p style={{fontSize: '14px', color: '#999'}}>No questions submitted yet.</p>
          </div>
        </div>
      </main>
    </div>
  );
}