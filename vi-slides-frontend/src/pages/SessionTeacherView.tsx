import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL);

export default function SessionTeacherView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sessionStatus, setSessionStatus] = useState("active");
  const [isResponding, setIsResponding] = useState(false);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchQuestions();
    socket.emit('join-session', code);
    socket.on('question-added', (newQ) => setQuestions((prev) => [...prev, newQ]));
    // THIS REFLECTS THE ANSWER IN THE SIDEBAR AND SLIDE IMMEDIATELY
    socket.on('question-updated', (updatedQ) => {
      setQuestions((prev) => prev.map(q => q._id === updatedQ._id ? updatedQ : q));
    });
    socket.on('session-status-changed', (status) => setSessionStatus(status));
    return () => { socket.off(); };
  }, [code]);

  const fetchQuestions = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions/${code}`);
    setQuestions(res.data);
  };

  const handleRespond = async () => {
    const activeQ = questions[activeIndex];
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/questions/${activeQ._id}`, {
        teacherResponse: responseText,
        isAnswered: true
      });
      // Tell everyone the question now has an answer
      socket.emit('update-question', { sessionCode: code, question: res.data });
      setIsResponding(false);
      setResponseText("");
    } catch (err) { alert("Error"); }
  };

  const activeQ = questions[activeIndex];

  return (
    <div className="full-page">
      <header className="navbar">
        <h2 style={{fontWeight: 900}}>PROFESSOR CONTROL</h2>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className="btn-3d btn-logout" onClick={() => navigate('/teacher')}>End Session</button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <p className="sidebar-title">Incoming Questions</p>
          {questions.map((q, i) => (
            <div key={i} onClick={() => setActiveIndex(i)} 
              className={`feed-item ${q.isAnswered ? 'answered-border' : 'unanswered-border'}`}
              style={{cursor: 'pointer', opacity: activeIndex === i ? 1 : 0.6}}>
              {q.text}
              {q.isAnswered && <span style={{fontSize: '9px', color: '#2ecc71', display: 'block'}}>✓ ANSWERED</span>}
            </div>
          ))}
        </aside>

        <main className="main-stage">
          <div className="projector-box" onClick={() => navigator.clipboard.writeText(code || "")}>
            <h1 className="giant-code">{code}</h1>
          </div>

          <div className="glass-card">
            {activeQ ? (
              <>
                <p style={{fontSize: '12px', color: '#555'}}>SLIDE {activeIndex + 1}</p>
                <h2 style={{margin: '20px 0'}}>"{activeQ.text}"</h2>
                
                {activeQ.isAnswered && (
                  <div className="response-box">
                    <span className="response-label">Your Response</span>
                    <p style={{margin: 0, fontSize: '14px'}}>{activeQ.teacherResponse}</p>
                  </div>
                )}

                <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px'}}>
                  <button className="btn-3d btn-student" onClick={() => {setResponseText(activeQ.teacherResponse || ""); setIsResponding(true)}}>Respond</button>
                  <button disabled={activeIndex === 0} className="btn-3d" style={{background: '#333'}} onClick={() => setActiveIndex(activeIndex-1)}>Prev</button>
                  <button disabled={activeIndex === questions.length-1} className="btn-3d" style={{background: '#333'}} onClick={() => setActiveIndex(activeIndex+1)}>Next</button>
                </div>
              </>
            ) : <p>No questions yet.</p>}
          </div>
        </main>
      </div>

      {isResponding && (
        <div className="full-page" style={{position: 'fixed', top: 0, left: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="glass-card" style={{maxWidth: '500px'}}>
             <h3>Draft Response</h3>
             <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} />
             <div style={{display: 'flex', gap: '10px'}}>
                <button className="btn-3d btn-teacher" onClick={handleRespond}>Publish</button>
                <button className="btn-3d btn-logout" onClick={() => setIsResponding(false)}>Cancel</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}