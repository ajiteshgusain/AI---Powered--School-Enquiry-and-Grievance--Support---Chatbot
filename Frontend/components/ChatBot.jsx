import React, { useState } from 'react';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I can answer school FAQs (fees, timings, admissions) or help you log and track a grievance.' }
  ]);
  const [input, setInput] = useState('');
  const [trackId, setTrackId] = useState('');
  const [trackStatus, setTrackStatus] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      if (userText.toLowerCase().includes('fee')) {
        setMessages(prev => [...prev, { sender: 'bot', text: 'School fees for Class 6 are ₹45,000 per term payable before the 10th of every quarter.' }]);
      } else if (userText.toLowerCase().includes('complaint')) {
        setMessages(prev => [...prev, { sender: 'bot', text: 'To log a complaint, please provide: 1. Student Name, 2. Class & Section, and 3. Description of the issue.' }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Thank you for reaching out. Your query has been noted.' }]);
      }
    }, 500);
  };

  const handleTrack = () => {
    if (!trackId.trim()) return;
    if (trackId.toUpperCase() === 'SCH-2026-0042') {
      setTrackStatus({ id: 'SCH-2026-0042', status: 'In Progress', department: 'Principal', note: 'Inspecting lights tonight' });
    } else {
      setTrackStatus({ error: 'Ticket ID not found. Try SCH-2026-0042.' });
    }
  };

  return (
    <div className="container chat-window">
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Track Grievance Status</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Enter Track ID (e.g., SCH-2026-0042)" 
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={handleTrack}>Track</button>
        </div>
        {trackStatus && (
          <div style={{ marginTop: '10px', fontSize: '0.85rem', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
            {trackStatus.error ? (
              <span style={{ color: 'red' }}>{trackStatus.error}</span>
            ) : (
              <div>
                <strong>{trackStatus.id}</strong>: Status is <span className="badge badge-inprogress">{trackStatus.status}</span> with <strong>{trackStatus.department}</strong>.
                <div style={{ marginTop: '4px', color: '#666' }}>Latest Note: {trackStatus.note}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>AI School Support Assistant</h3>
        <span className="subtitle">Instant answers to FAQs and formal grievance logging</span>

        <div className="chat-messages" style={{ marginTop: '12px' }}>
          {messages.map((m, idx) => (
            <div key={idx} className={`message ${m.sender}`}>
              {m.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="chat-input" style={{ marginTop: '10px' }}>
          <input 
            type="text" 
            placeholder="Type your question or issue..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
}