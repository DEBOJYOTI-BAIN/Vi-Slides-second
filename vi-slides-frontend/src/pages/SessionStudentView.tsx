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
  const [user, setUser] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [sessionStatus, setSessionStatus] = useState("active");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.name) navigate('/');
    setUser(userData);

    fetchQuestions();
    fetchSessionStatus();

    socket.emit('join-session', code);

    socket.on('question-added', (newQ) => {
      setQuestions((prev) => [...prev, newQ]);
    });

    socket.on('question-updated', (updatedQ) => {
      setQuestions((prev) => prev.map(q => q._id === updatedQ._id ? updatedQ : q));
      if (selectedQuestion?._id === updatedQ._id) setSelectedQuestion(updatedQ);
    });

    socket.on('question-deleted', (id) => {
      setQuestions((prev) => prev.filter(q => q._id !== id));
      if (selectedQuestion?._id === id) setSelectedQuestion(null);
    });

    socket.on('session-status-changed', (status) => {
      setSessionStatus(status);
      if (status === 'ended') {
        alert("The teacher has ended this session.");
        navigate('/student');
      }
    });

    return () => {
      socket.off('question-added');
      socket.off('question-updated');
      socket.off('question-deleted');
      socket.off('session-status-changed');
    };
  }, [code, navigate, selectedQuestion]);

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

  const handleSubmit = async () => {
    if (!q.trim()) return;
    if (sessionStatus === 'paused') {
        alert("Session is paused. You cannot submit questions right now.");
        return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/questions/submit`, {
        sessionCode: code,
        studentId: user._id,
        text: q
      });
      socket.emit('new-question', { sessionCode: code, question: res.data });
      setQ("");
    } catch (err: any) { alert(err.response?.data?.message || "Submit Error"); }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/questions/${id}`, { text: editText });
      socket.emit('update-question', { sessionCode: code, question: res.data });
      setEditingId(null);
    } catch (err) { alert("Edit Error"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/questions/${id}`);
      socket.emit('delete-question', { sessionCode: code, questionId: id });
    } catch (err) { alert("Delete Error"); }
  };

  return (
    <div className="full-page">
      <header className="navbar">
        <button className="btn-3d btn-logout" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => navigate('/student')}>Exit</button>
        <h2 style={{ fontWeight: 300 }}>LIVE: {code} {sessionStatus === 'paused' && <span style={{ color: '#f1c40f', fontSize: '14px' }}>(PAUSED)</span>}</h2>
        <div style={{ width: '60px' }}></div>
      </header>
      
      <div style={{ display: 'flex', height: 'calc(100vh - 80px)', width: '100%' }}>
        {/* Leftmost Sidebar: Questions Queue */}
        <aside style={{ width: '350px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '20px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
          <h2 style={{ color: '#00d2ff', marginBottom: '20px', fontSize: '20px' }}>Question Queue</h2>
          {questions.length === 0 && <p style={{ color: '#777' }}>No questions yet.</p>}
          {questions.map((question) => (
            <div key={question._id} style={{ marginBottom: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: question.isAnswered ? '4px solid #2ecc71' : 'none' }}>
              {editingId === question._id ? (
                <div>
                  <textarea value={editText} onChange={(e) => setEditText(e.target.value)} style={{ minHeight: '60px', width: '100%' }} />
                  <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    <button className="btn-3d btn-student" style={{ padding: '5px 10px', fontSize: '12px', flex: 1 }} onClick={() => handleEdit(question._id)}>Save</button>
                    <button className="btn-3d btn-logout" style={{ padding: '5px 10px', fontSize: '12px', flex: 1 }} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ margin: 0, cursor: 'pointer', fontSize: '15px', lineHeight: '1.4' }} onClick={() => question.isAnswered && setSelectedQuestion(question)}>{question.text}</p>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '15px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                    {question.studentId === user?._id && (
                      <>
                        <span style={{ color: '#00d2ff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }} onClick={() => { setEditingId(question._id); setEditText(question.text); }}>EDIT</span>
                        <span style={{ color: '#ff4757', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }} onClick={() => handleDelete(question._id)}>DELETE</span>
                      </>
                    )}
                    {question.isAnswered && <span style={{ color: '#2ecc71', fontSize: '11px', fontWeight: 700 }}>✓ RESPONDED</span>}
                  </div>
                </>
              )}
            </div>
          ))}
        </aside>

        {/* Main Section: Submit Area */}
        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', opacity: sessionStatus === 'paused' ? 0.6 : 1 }}>
            <h2 style={{ color: '#00d2ff', marginBottom: '20px' }}>Ask Your Question</h2>
            {sessionStatus === 'paused' ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(241,196,15,0.1)', borderRadius: '15px', color: '#f1c40f' }}>
                    <h3 style={{ margin: 0 }}>Session is Paused</h3>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>Questions cannot be submitted at this time.</p>
                </div>
            ) : (
                <>
                    <textarea 
                        placeholder="What's on your mind?" 
                        value={q} onChange={(e) => setQ(e.target.value)} 
                        style={{ minHeight: '150px' }}
                    />
                    <div style={{ height: '20px' }}></div>
                    <button className="btn-3d btn-student" onClick={handleSubmit}>Analyze & Send</button>
                </>
            )}
          </div>
        </main>
      </div>

      {/* Response Modal */}
      {selectedQuestion && (
        <div className="full-page flex-center" style={{ position: 'fixed', top: 0, left: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100 }}>
          <div className="glass-card" style={{ maxWidth: '500px' }}>
            <h3 style={{ color: '#00d2ff', marginBottom: '20px' }}>Teacher's Response</h3>
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <strong style={{ color: '#aaa', fontSize: '12px' }}>QUESTION:</strong>
              <p style={{ margin: '5px 0 15px 0', fontSize: '16px' }}>{selectedQuestion.text}</p>
              <strong style={{ color: '#2ecc71', fontSize: '12px' }}>RESPONSE:</strong>
              <p style={{ margin: '5px 0 0 0', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', lineHeight: '1.6' }}>{selectedQuestion.teacherResponse}</p>
            </div>
            <button className="btn-3d btn-logout" onClick={() => setSelectedQuestion(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}