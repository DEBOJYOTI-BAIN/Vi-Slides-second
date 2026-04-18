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
  const [myIndex, setMyIndex] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions/${code}`);
      setQuestions(res.data);
    };
    fetchQuestions();
    socket.emit('join-session', code);
    socket.on('question-added', (newQ) => setQuestions((prev) => [...prev, newQ]));
    socket.on('question-updated', (upQ) => setQuestions((prev) => prev.map(item => item._id === upQ._id ? upQ : item)));
    socket.on('session-status-changed', (status) => { if (status === 'ended') navigate('/student'); });
    return () => { socket.off(); };
  }, [code, navigate]);

  const handleSubmit = async () => {
    if (!q.trim()) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/questions/submit`, {
        sessionCode: code, 
        studentId: user._id, 
        studentName: user.name, // SENDS REAL NAME
        text: q
      });
      socket.emit('new-question', { sessionCode: code, question: res.data });
      setQ("");
      setMyIndex(0);
    } catch (err) { alert("Failed"); }
  };

  const myQs = questions.filter(item => item.studentId === user._id).reverse();
  const activeMyQ = myQs[myIndex];

  return (
    <div className="full-page">
      <header className="navbar">
        <button className="btn-3d btn-logout" style={{width:'auto'}} onClick={() => navigate('/student')}>Exit</button>
        <h2 style={{fontWeight: 900}}>STUDENT PORTAL: {code}</h2>
        <div style={{width:'80px'}}></div>
      </header>

      <div className="dashboard-layout">
        {/* SIDE PANEL: SEE EVERYONE'S QUESTIONS & ANSWERS */}
        <aside className="sidebar">
          <p className="sidebar-title">Global Class Activity</p>
          {questions.map((item, i) => (
            <div key={i} className={`feed-item ${item.isAnswered ? 'answered' : ''}`}>
              <span className="student-tag">{item.studentName}</span>
              {item.text}
              {item.isAnswered && <div className="peer-response">PROFESSOR: {item.teacherResponse}</div>}
            </div>
          ))}
        </aside>

        <main className="main-stage">
          <div className="glass-card" style={{marginBottom: '30px'}}>
            <h3>Ask the Professor</h3>
            <textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type your query..." />
            <button className="btn-3d btn-student btn-submit" onClick={handleSubmit}>Send</button>
          </div>

          {/* PRIVATE LOG: MY QUESTIONS & ANSWERS ONLY */}
          <div className="glass-card session-card" style={{borderLeft: '10px solid #00d2ff'}}>
            <p className="sidebar-title" style={{color: '#00d2ff', fontWeight: 900}}>My Private History</p>
            {activeMyQ ? (
              <>
                <p style={{margin: '15px 0', fontSize: '18px'}}>"{activeMyQ.text}"</p>
                {activeMyQ.isAnswered ? (
                  <div className="peer-response" style={{fontSize: '14px', padding: '15px'}}>
                    <strong>ANSWER:</strong> {activeMyQ.teacherResponse}
                  </div>
                ) : <p style={{color: '#555', fontSize: '12px'}}>Waiting for response...</p>}
                
                <div style={{display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px'}}>
                  <button disabled={myIndex === 0} className="btn-3d" style={{background: '#333'}} onClick={() => setMyIndex(myIndex-1)}>Prev</button>
                  <span style={{display:'flex', alignItems:'center'}}>{myIndex + 1} / {myQs.length}</span>
                  <button disabled={myIndex === myQs.length-1} className="btn-3d" style={{background: '#333'}} onClick={() => setMyIndex(myIndex+1)}>Next</button>
                </div>
              </>
            ) : <p>No questions asked yet.</p>}
          </div>
        </main>
      </div>
    </div>
  );
}