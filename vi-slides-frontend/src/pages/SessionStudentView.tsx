import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SessionStudentView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [qText, setQText] = useState("");

  return (
    <div className="full-page">
      <header className="navbar">
        <button className="btn-3d btn-logout" style={{padding: '12px 20px'}} onClick={() => navigate('/student')}>Leave</button>
        <h2 style={{margin: 0, fontWeight: 300}}>SESSION: {code}</h2>
        <div style={{width: '80px'}}></div>
      </header>

      <main className="centered-container">
        <div className="glass-card" style={{maxWidth: '500px', padding: '40px'}}>
          <h2 style={{color: '#00d2ff'}}>Ask the AI Brain</h2>
          <textarea 
            placeholder="Submit your query..." 
            value={qText} 
            onChange={(e) => setQText(e.target.value)} 
          />
          <button className="btn-3d btn-student" style={{width: '100%'}}>Analyze & Send</button>
          
          <div style={{marginTop: '30px', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px'}}>
             <p style={{color: '#555', fontSize: '12px', textTransform: 'uppercase'}}>Activity Log</p>
             <p style={{color: '#888'}}>No questions submitted in this session.</p>
          </div>
        </div>
      </main>
    </div>
  );
}