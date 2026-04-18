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
    fetchQuestions();
    socket.emit('join-session', code);
    socket.on('question-added', (newQ) => setQuestions((prev) => [...prev, newQ]));
    // CRITICAL: This reflects the teacher's answer in the student's sidebar and carousel instantly
    socket.on('question-updated', (updatedQ) => {
      setQuestions((prev) => prev.map(item => item._id === updatedQ._id ? updatedQ : item));
    });
    return () => { socket.off(); };
  }, [code]);

  const fetchQuestions = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions/${code}`);
    setQuestions(res.data);
  };

  const handleSubmit = async () => {
    if (!q.trim()) return;
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/questions/submit`, {
      sessionCode: code, studentId: user._id, text: q
    });
    socket.emit('new-question', { sessionCode: code, question: res.data });
    setQ("");
    setMyIndex(0); // View the newest question
  };

  const myQs = questions.filter(item => item.studentId === user._id).reverse();
  const activeMyQ = myQs[myIndex];

  return (
    <div className="full-page">
      <header className="navbar">
        <button className="btn-3d btn-logout" onClick={() => navigate('/student')}>Exit</button>
        <h2 style={{fontWeight: 900}}>STUDENT PORTAL</h2>
        <div style={{width: '80px'}}></div>
      </header>

      <div className="dashboard-layout">
        {/* SIDE PANEL: ALL QUESTIONS FROM EVERYONE */}
        <aside className="sidebar">
          <p className="sidebar-title">Class Activity</p>
          {questions.map((item, i) => (
            <div key={i} className={`feed-item ${item.isAnswered ? 'answered-border' : ''}`}>
              <span style={{fontSize: '9px', color: '#555'}}>{item.studentId === user._id ? "YOU" : "PEER"}</span>
              <p style={{margin: '5px 0'}}>{item.text}</p>
              {item.isAnswered && <p style={{fontSize: '11px', color: '#2ecc71'}}>✓ Professor Responded</p>}
            </div>
          ))}
        </aside>

        <main className="main-stage">
          {/* SUBMISSION BOX */}
          <div className="glass-card" style={{marginBottom: '20px'}}>
            <h3>Submit Question</h3>
            <textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type here..." />
            <button className="btn-3d btn-student" onClick={handleSubmit}>Send to Professor</button>
          </div>

          {/* PERSONAL CAROUSEL: MY QUESTIONS & ANSWERS */}
          <div className="glass-card" style={{borderLeft: '10px solid #00d2ff'}}>
            <p style={{fontSize: '10px', color: '#00d2ff', fontWeight: 900}}>MY PRIVATE LOG</p>
            {activeMyQ ? (
              <>
                <p style={{margin: '15px 0', fontSize: '18px'}}>"{activeMyQ.text}"</p>
                {activeMyQ.isAnswered && (
                  <div className="response-box">
                    <span className="response-label">Professor's Answer</span>
                    <p style={{margin: 0, fontSize: '14px'}}>{activeMyQ.teacherResponse}</p>
                  </div>
                )}
                <div style={{display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px'}}>
                  <button disabled={myIndex === 0} className="btn-3d" style={{background: '#333'}} onClick={() => setMyIndex(myIndex-1)}>Prev</button>
                  <span style={{display:'flex', alignItems:'center'}}>{myIndex + 1} / {myQs.length}</span>
                  <button disabled={myIndex === myQs.length-1} className="btn-3d" style={{background: '#333'}} onClick={() => setMyIndex(myIndex+1)}>Next</button>
                </div>
              </>
            ) : <p style={{color: '#555'}}>No questions asked yet.</p>}
          </div>
        </main>
      </div>
    </div>
  );
}