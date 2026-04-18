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
    const fetchAll = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions/${code}`);
      setQuestions(res.data);
    };
    fetchAll();
    socket.emit('join-session', code);
    socket.on('question-added', (newQ) => setQuestions((prev) => [...prev, newQ]));
    socket.on('question-updated', (upQ) => setQuestions((prev) => prev.map(q => q._id === upQ._id ? upQ : q)));
    socket.on('question-deleted', (id) => setQuestions((prev) => prev.filter(q => q._id !== id)));
    return () => { socket.off(); };
  }, [code]);

  const handleTerminate = async () => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/end/${code}`);
    socket.emit('change-session-status', { sessionCode: code, status: 'ended' });
    navigate('/teacher');
  };

  const handleRespond = async () => {
    const activeQ = questions[activeIndex];
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/questions/${activeQ._id}`, {
      teacherResponse: responseText, isAnswered: true
    });
    socket.emit('update-question', { sessionCode: code, question: res.data });
    setIsResponding(false);
    setResponseText("");
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/questions/${id}`);
    socket.emit('delete-question', { sessionCode: code, questionId: id });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code || "");
    alert("Code Copied!");
  };

  const activeQ = questions[activeIndex];

  return (
    <div className="full-page">
      <header className="navbar">
        <h2 style={{fontWeight: 900}}>PROFESSOR CONTROL</h2>
        <button className="btn-3d btn-logout" onClick={handleTerminate}>Terminate Session 🛑</button>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <p style={{fontSize:'11px', color:'#00d2ff', letterSpacing:'2px'}}>LIVE QUEUE</p>
          {questions.map((q, i) => (
            <div key={i} onClick={() => setActiveIndex(i)} className={`feed-item ${q.isAnswered ? 'answered' : ''}`} style={{cursor:'pointer', opacity: activeIndex === i ? 1 : 0.4}}>
              <span className="student-tag">{q.studentName}</span>
              {q.text}
              {q.isAnswered && <div style={{marginTop:'10px', color:'#2ecc71', fontSize:'11px'}}>✓ {q.teacherResponse}</div>}
            </div>
          ))}
        </aside>

        <main className="main-stage">
          <div className="projector-box" onClick={copyToClipboard}>
            <h1 className="giant-code">{code}</h1>
            <p className="copy-hint">Click digits to copy code</p>
          </div>

          <div className="glass-card session-card">
            {activeQ ? (
              <>
                <span className="student-tag" style={{fontSize:'12px'}}>{activeQ.studentName} asks:</span>
                <h2 style={{margin:'20px 0'}}>"{activeQ.text}"</h2>
                {activeQ.isAnswered && <div className="response-box"><p>{activeQ.teacherResponse}</p></div>}
                <div style={{display:'flex', gap:'15px', justifyContent:'center', marginTop:'30px'}}>
                  <button className="btn-3d btn-student" onClick={() => {setResponseText(activeQ.teacherResponse); setIsResponding(true)}}>Respond</button>
                  <button className="btn-3d btn-logout" style={{fontSize:'10px', padding:'10px 20px'}} onClick={() => handleDelete(activeQ._id)}>Delete</button>
                  <button disabled={activeIndex === 0} className="btn-3d" style={{background:'#333'}} onClick={() => setActiveIndex(activeIndex-1)}>Prev</button>
                  <button disabled={activeIndex === questions.length-1} className="btn-3d" style={{background:'#333'}} onClick={() => setActiveIndex(activeIndex+1)}>Next</button>
                </div>
              </>
            ) : <p>Waiting for questions...</p>}
          </div>
        </main>
      </div>

      {isResponding && (
        <div className="full-page" style={{position:'fixed', top:0, left:0, background:'rgba(0,0,0,0.9)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="glass-card">
             <h3>Answering {activeQ.studentName}</h3>
             <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} />
             <div style={{display:'flex', gap:'10px'}}>
                <button className="btn-3d btn-teacher" onClick={handleRespond}>Publish</button>
                <button className="btn-3d btn-logout" onClick={() => setIsResponding(false)}>Cancel</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}