import { useParams, useNavigate } from 'react-router-dom';

export default function SessionStudentView() {
  const { code } = useParams();
  const navigate = useNavigate();

  return (
    <div className="full-page" style={{background: '#f0f2f5'}}>
      <header className="nav-header">
        <button className="btn-3d btn-logout" onClick={() => navigate('/student')}>Leave Class</button>
        <h2 style={{color: '#333'}}>Session: {code}</h2>
        <div style={{width: '100px'}}></div>
      </header>

      <main className="flex-center" style={{height: 'calc(100% - 80px)'}}>
        <div className="glass-card" style={{width: '450px'}}>
          <h1 style={{color: '#4CAF50'}}>Joined ✅</h1>
          <p style={{color: '#666', marginBottom: '30px'}}>Stay on this screen to ask questions.</p>
          <textarea placeholder="Ask your question..." style={{width: '100%', height: '100px', borderRadius: '12px', padding: '10px', fontSize: '16px'}} />
          <button className="btn-3d btn-student" style={{width: '100%', marginTop: '20px'}}>Ask AI</button>
        </div>
      </main>
    </div>
  );
}