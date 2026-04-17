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

    socket.on('question-added', (newQ) => {
      setQuestions((prev) => [...prev, newQ]);
    });

    socket.on('question-updated', (updatedQ) => {
      setQuestions((prev) => prev.map(q => q._id === updatedQ._id ? updatedQ : q));
    });

    socket.on('question-deleted', (id) => {
      setQuestions((prev) => prev.filter(q => q._id !== id));
    });

    socket.on('session-status-changed', (status) => {
        setSessionStatus(status);
    });

    return () => {
      socket.off('question-added');
      socket.off('question-updated');
      socket.off('question-deleted');
      socket.off('session-status-changed');
    };
  }, [code]);

  useEffect(() => {
    if (questions.length > 0 && activeIndex >= questions.length) {
      setActiveIndex(questions.length - 1);
    }
  }, [questions, activeIndex]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions/${code}`);
      setQuestions(res.data); 
    } catch (err) { console.error("Fetch Error", err); }
  };

  const fetchSessionStatus = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sessions/join/${code}`);
        setSessionStatus(res.data.session.status);
    } catch (err) { console.error("Status Fetch Error", err); }
  }

  const handleStatusChange = async (action: 'pause' | 'resume' | 'end') => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/${action}/${code}`);
      const newStatus = action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'ended';
      
      socket.emit('change-session-status', { sessionCode: code, status: newStatus });

      if (action === 'end') navigate('/teacher');
      else setSessionStatus(newStatus);
    } catch (err) { alert(`Error during ${action}`); }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/questions/${id}`);
      socket.emit('delete-question', { sessionCode: code, questionId: id });
    } catch (err) { alert("Delete Error"); }
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
    } catch (err) { alert("Response Error"); }
  };

  const activeQuestion = questions[activeIndex];

  return (
    <div className="full-page">
      <header className="navbar">
        <div style={{ width: '100px' }}></div> {/* Spacer for alignment */}
        <h2 style={{ fontWeight: 300 }}>SESSION: {code} ({sessionStatus.toUpperCase()})</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {sessionStatus === 'active' ? (
            <button className="btn-3d btn-teacher" style={{ width: 'auto', padding: '10px 20px', background: '#f1c40f' }} onClick={() => handleStatusChange('pause')}>Pause</button>
          ) : (
            <button className="btn-3d btn-teacher" style={{ width: 'auto', padding: '10px 20px', background: '#2ecc71' }} onClick={() => handleStatusChange('resume')}>Resume</button>
          )}
          <button className="btn-3d btn-logout" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => handleStatusChange('end')}>Terminate</button>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 80px)', width: '100%' }}>
        {/* Leftmost Sidebar: Questions List */}
        <aside style={{ width: '300px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '20px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
          <h3 style={{ color: '#00d2ff', marginBottom: '20px', fontSize: '18px' }}>Queue</h3>
          {questions.map((q, idx) => (
            <div 
              key={q._id} 
              onClick={() => setActiveIndex(idx)}
              style={{ 
                padding: '12px', 
                marginBottom: '10px', 
                background: activeIndex === idx ? 'rgba(0,210,255,0.2)' : 'rgba(255,255,255,0.05)', 
                borderRadius: '10px', 
                cursor: 'pointer',
                borderLeft: q.isAnswered ? '4px solid #2ecc71' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.text}</p>
              {q.isAnswered && <span style={{ fontSize: '10px', color: '#2ecc71', fontWeight: 700 }}>RESPONDED</span>}
            </div>
          ))}
        </aside>

        {/* Main Side: Slide View */}
        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <div className="glass-card" style={{ maxWidth: '800px', width: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {activeQuestion ? (
              <>
                <p style={{ color: '#aaa', letterSpacing: '2px', fontSize: '14px' }}>QUESTION {activeIndex + 1} OF {questions.length}</p>
                <h1 style={{ fontSize: '38px', margin: '30px 0', lineHeight: '1.2' }}>{activeQuestion.text}</h1>
                
                {activeQuestion.isAnswered && (
                  <div style={{ background: 'rgba(46,204,113,0.1)', padding: '20px', borderRadius: '15px', marginBottom: '30px', textAlign: 'left', borderLeft: '4px solid #2ecc71' }}>
                    <strong style={{ color: '#2ecc71', fontSize: '12px' }}>YOUR RESPONSE:</strong>
                    <p style={{ margin: '10px 0 0 0', fontSize: '16px', lineHeight: '1.5' }}>{activeQuestion.teacherResponse}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                  <button className="btn-3d btn-student" style={{ width: 'auto', padding: '12px 30px' }} onClick={() => { setSelectedQuestion(activeQuestion); setResponseText(activeQuestion.teacherResponse || ""); setIsResponding(true); }}>
                    {activeQuestion.isAnswered ? "Edit Response" : "Respond"}
                  </button>
                  <button className="btn-3d btn-logout" style={{ background: '#ff4757', width: 'auto', padding: '12px 30px' }} onClick={() => handleDelete(activeQuestion._id)}>Delete</button>
                </div>

                <div style={{ marginTop: '50px', display: 'flex', gap: '30px', justifyContent: 'center' }}>
                  <button disabled={activeIndex === 0} onClick={() => setActiveIndex(activeIndex - 1)} style={{ background: 'none', border: 'none', color: '#00d2ff', cursor: 'pointer', opacity: activeIndex === 0 ? 0.3 : 1, fontSize: '16px', fontWeight: 600 }}>← PREVIOUS</button>
                  <button disabled={activeIndex === questions.length - 1} onClick={() => setActiveIndex(activeIndex + 1)} style={{ background: 'none', border: 'none', color: '#00d2ff', cursor: 'pointer', opacity: activeIndex === questions.length - 1 ? 0.3 : 1, fontSize: '16px', fontWeight: 600 }}>NEXT →</button>
                </div>
              </>
            ) : (
              <div style={{ color: '#777' }}>
                <h2 style={{ fontSize: '32px' }}>Waiting for questions...</h2>
                <p style={{ fontSize: '18px', marginTop: '10px' }}>Students can join using code: <strong style={{ color: '#00d2ff' }}>{code}</strong></p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Response Modal */}
      {isResponding && (
        <div className="full-page flex-center" style={{ position: 'fixed', top: 0, left: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100 }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '90%' }}>
            <h3 style={{ color: '#00d2ff', marginBottom: '15px' }}>{selectedQuestion.isAnswered ? "Edit Response" : "Submit Response"}</h3>
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <strong style={{ color: '#aaa', fontSize: '12px' }}>QUESTION:</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>{selectedQuestion.text}</p>
            </div>
            <textarea 
              placeholder="Type your explanation here..." 
              value={responseText} onChange={(e) => setResponseText(e.target.value)} 
              style={{ minHeight: '180px' }}
            />
            <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
              <button className="btn-3d btn-student" onClick={handleRespond}>Save Response</button>
              <button className="btn-3d btn-logout" onClick={() => setIsResponding(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}