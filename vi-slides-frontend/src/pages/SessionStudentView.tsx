import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL);

export default function SessionStudentView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [sessionStatus, setSessionStatus] = useState("active");
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.name) navigate('/');
    fetchQuestions();
    fetchSessionStatus();
    socket.emit('join-session', code);
    socket.on('question-added', (newQ) => setQuestions(prev => [...prev, newQ]));
    socket.on('session-status-changed', (status) => {
      setSessionStatus(status);
      if (status === 'ended') { alert("Session Terminated"); navigate('/student'); }
    });
    return () => { socket.off('question-added'); socket.off('session-status-changed'); };
  }, [code]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions/${code}`);
      setQuestions(res.data);
    } catch (e) {}
  };

  const fetchSessionStatus = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sessions/join/${code}`);
      setSessionStatus(res.data.session.status);
    } catch (e) {}
  }

  const handleSubmit = async () => {
    if (!q.trim() || sessionStatus === 'paused') return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/questions/submit`, {
        sessionCode: code, studentId: user._id, text: q
      });
      socket.emit('new-question', { sessionCode: code, question: res.data });
      setQ("");
    } catch (err) { alert("Submit Failed"); }
  };

  return (
    <div className="full-page">
      <header className="navbar">
        <button className="btn-3d btn-logout" style={{padding: '10px 20px'}} onClick={() => navigate('/student')}>Exit</button>
        <h2 style={{fontWeight: 900}}>LIVE SESSION: {code}</h2>
        <div style={{padding: '5px 15px', borderRadius: '20px', background: sessionStatus === 'active' ? '#2ecc71' : '#f1c40f', fontSize: '10px', fontWeight: 900}}>
          {sessionStatus.toUpperCase()}
        </div>
      </header>

      <main className="centered-container">
        <div className="glass-card" style={{maxWidth: '500px', opacity: sessionStatus === 'paused' ? 0.6 : 1}}>
          <h2 style={{color: '#00d2ff', marginBottom: '20px'}}>Ask Question</h2>
          <textarea 
            placeholder={sessionStatus === 'active' ? "What is your query?" : "Submissions Paused"}
            disabled={sessionStatus === 'paused'}
            value={q} onChange={(e) => setQ(e.target.value)}
            style={{height: '120px'}}
          />
          <button className="btn-3d btn-student" style={{marginTop: '20px'}} onClick={handleSubmit}>Submit to Professor</button>
          
          <div style={{marginTop: '30px', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px'}}>
            <p style={{fontSize: '10px', color: '#555', textTransform: 'uppercase'}}>My Session Feed</p>
            <div style={{maxHeight: '150px', overflowY: 'auto'}}>
               {questions.filter(item => item.studentId === user._id).map((item, i) => (
                 <div key={i} style={{fontSize: '13px', marginBottom: '10px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px'}}>
                   <p style={{margin: 0}}>{item.text}</p>
                   {item.isAnswered && <p style={{margin: '5px 0 0 0', color: '#2ecc71', fontSize: '11px'}}>✓ {item.teacherResponse}</p>}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}