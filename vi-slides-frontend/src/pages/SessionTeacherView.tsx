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
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  useEffect(() => {
    fetchQuestions();
    fetchSessionStatus();
    socket.emit('join-session', code);
    socket.on('question-added', (newQ) => setQuestions((prev) => [...prev, newQ]));
    socket.on('question-updated', (updatedQ) => setQuestions((prev) => prev.map(q => q._id === updatedQ._id ? updatedQ : q)));
    socket.on('question-deleted', (id) => setQuestions((prev) => prev.filter(q => q._id !== id)));
    socket.on('session-status-changed', (status) => setSessionStatus(status));
    return () => { socket.off('question-added'); socket.off('question-updated'); socket.off('question-deleted'); socket.off('session-status-changed'); };
  }, [code]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions/${code}`);
      setQuestions(res.data); 
    } catch (err) { console.error(err); }
  };

  const fetchSessionStatus = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sessions/join/${code}`);
      setSessionStatus(res.data.session.status);
    } catch (err) { console.error(err); }
  }

  const handleStatusChange = async (action: 'pause' | 'resume' | 'end') => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/${action}/${code}`);
      const newStatus = action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'ended';
      socket.emit('change-session-status', { sessionCode: code, status: newStatus });
      if (action === 'end') navigate('/teacher');
      else setSessionStatus(newStatus);
    } catch (err) { alert("Error"); }
  };

  const copyFullCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      alert("6-Digit Code Copied Exactly!");
    }
  };

  const handleRespond = async () => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/questions/${selectedQuestion._id}`, {
        teacherResponse: responseText,
        isAnswered: true
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
        <h2 style={{fontWeight: 900, color: '#00d2ff'}}>SESSION: {code}</h2>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className="btn-3d btn-teacher" style={{background: sessionStatus === 'active' ? '#f1c40f' : '#2ecc71', padding: '10px 20px'}} onClick={() => handleStatusChange(sessionStatus === 'active' ? 'pause' : 'resume')}>
            {sessionStatus === 'active' ? 'Pause' : 'Resume'}
          </button>
          <button className="btn-3d btn-logout" style={{padding: '10px 20px'}} onClick={() => handleStatusChange('end')}>Terminate</button>
        </div>
      </header>

      <main className="centered-container" style={{flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '30px'}}>
        
        {/* GIANT PROJECTOR CODE */}
        <div className="projector-box" onClick={copyFullCode}>
          <p style={{color: '#555', fontSize: '12px', letterSpacing: '2px', margin: 0}}>STUDENT ACCESS KEY</p>
          <h1 className="join-code-huge">{code}</h1>
          <p style={{color: '#00d2ff', fontSize: '10px', marginTop: '5px'}}>CLICK TO COPY ALL DIGITS</p>
        </div>

        {/* QUESTION SLIDE */}
        <div className="glass-card" style={{maxWidth: '800px', minHeight: '350px', justifyContent: 'center', textAlign: 'center'}}>
          {activeQ ? (
            <>
              <p style={{color: '#555', fontSize: '12px'}}>QUESTION {activeIndex+1} / {questions.length}</p>
              <h1 style={{fontSize: '32px', margin: '20px 0'}}>"{activeQ.text}"</h1>
              
              <div style={{display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px'}}>
                <button className="btn-3d btn-student" onClick={() => { setSelectedQuestion(activeQ); setResponseText(activeQ.teacherResponse || ""); setIsResponding(true); }}>
                  {activeQ.isAnswered ? "Edit Answer" : "Respond"}
                </button>
                <button disabled={activeIndex === 0} onClick={() => setActiveIndex(activeIndex-1)} className="btn-3d" style={{background: '#333', opacity: activeIndex === 0 ? 0.2 : 1}}>Prev</button>
                <button disabled={activeIndex === questions.length - 1} onClick={() => setActiveIndex(activeIndex+1)} className="btn-3d" style={{background: '#333', opacity: activeIndex === questions.length - 1 ? 0.2 : 1}}>Next</button>
              </div>
            </>
          ) : (
            <h2 style={{color: '#444'}}>Waiting for student questions...</h2>
          )}
        </div>
      </main>

      {isResponding && (
        <div className="full-page flex-center" style={{position: 'fixed', top: 0, left: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000}}>
          <div className="glass-card" style={{maxWidth: '600px'}}>
            <h3>Submit Response</h3>
            <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} style={{height: '150px'}} />
            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
               <button className="btn-3d btn-teacher" onClick={handleRespond}>Publish</button>
               <button className="btn-3d btn-logout" onClick={() => setIsResponding(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}