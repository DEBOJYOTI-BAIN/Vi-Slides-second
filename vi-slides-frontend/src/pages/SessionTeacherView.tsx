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
  const [isResponding, setIsResponding] = useState(false);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchQuestions();
    socket.emit('join-session', code);
    socket.on('question-added', (newQ) => setQuestions((prev) => [...prev, newQ]));
    socket.on('question-updated', (upQ) => setQuestions((prev) => prev.map(q => q._id === upQ._id ? upQ : q)));
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
        teacherResponse: responseText, isAnswered: true
      });
      socket.emit('update-question', { sessionCode: code, question: res.data });
      setIsResponding(false);
      setResponseText("");
    } catch (err) { alert("Error"); }
  };

  const activeQ = questions[activeIndex];

  return (
    <div className="full-page">
      <header className="navbar">
        <h2 style={{fontWeight: 900}}>PROFESSOR: {code}</h2>
        <button className="btn-3d btn-logout" onClick={() => navigate('/teacher')}>Exit Session</button>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <p className="sidebar-title">Incoming Feed</p>
          {questions.map((q, i) => (
            <div key={i} onClick={() => setActiveIndex(i)} className={`feed-item ${q.isAnswered ? 'answered-border' : 'unanswered-border'}`} style={{cursor: 'pointer', opacity: activeIndex === i ? 1 : 0.4}}>
              <span className="student-tag">{q.studentName}</span>
              <p style={{margin: 0}}>{q.text}</p>
            </div>
          ))}
        </aside>

        <main className="main-stage">
          <div className="projector-box" onClick={() => {navigator.clipboard.writeText(code||""); alert("Copied!")}}>
            <h1 className="giant-code">{code}</h1>
            <button className="copy-btn">CLICK TO COPY CODE</button>
          </div>

          <div className="glass-card" style={{minHeight: '350px'}}>
            {activeQ ? (
              <>
                <span className="student-tag" style={{fontSize: '14px', padding: '5px 15px'}}>{activeQ.studentName} asks:</span>
                <h2 style={{margin: '20px 0'}}>"{activeQ.text}"</h2>
                
                {activeQ.isAnswered && (
                  <div className="response-box">
                    <span className="response-label">Your Answer</span>
                    <p>{activeQ.teacherResponse}</p>
                  </div>
                )}

                <div style={{display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px'}}>
                  <button className="btn-3d btn-student" onClick={() => {setResponseText(activeQ.teacherResponse); setIsResponding(true)}}>
                    {activeQ.isAnswered ? "Edit" : "Respond"}
                  </button>
                  <button disabled={activeIndex === 0} className="btn-3d" style={{background: '#333'}} onClick={() => setActiveIndex(activeIndex-1)}>Prev</button>
                  <button disabled={activeIndex === questions.length-1} className="btn-3d" style={{background: '#333'}} onClick={() => setActiveIndex(activeIndex+1)}>Next</button>
                </div>
              </>
            ) : <p>Waiting for questions...</p>}
          </div>
        </main>
      </div>

      {isResponding && (
        <div className="full-page flex-center" style={{position: 'fixed', background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="glass-card" style={{maxWidth: '500px'}}>
             <h3>Answering {activeQ.studentName}</h3>
             <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Type response..." />
             <button className="btn-3d btn-teacher" onClick={handleRespond}>Publish Answer</button>
             <button className="btn-3d btn-logout" style={{marginTop: '10px'}} onClick={() => setIsResponding(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}