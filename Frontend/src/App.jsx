import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://rd-public-school-backend.onrender.com';

/* ============================================================================
1. MANDATORY AUTHENTICATION GATE (Role-Verified Login & Registration)
============================================================================ */
function AuthGateway({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin
      ? { email, password }
      : { name, email, password, role, accessCode };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      localStorage.setItem('school_token', data.token);
      localStorage.setItem('school_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* Left Showcase Panel */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '16px' }}>
            CBSE Affiliated • Est. 1998
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '14px' }}>
            R.D. Public School<br />Digital Front Office
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.92, maxWidth: '480px' }}>
            A unified, role-protected portal for students, verified parents, and school administrators to resolve inquiries and track grievances.
          </p>
        </div>

        <div className="auth-hero-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '4px' }}>🤖 24/7 AI Helpdesk</strong>
            <span style={{ fontSize: '0.84rem', opacity: 0.9 }}>Instant answers on admissions, timings, fees, and campus facilities.</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '4px' }}>🔐 Role-Verified Access</strong>
            <span style={{ fontSize: '0.84rem', opacity: 0.9 }}>Protected Teacher/Admin and Parent registration via school passcodes.</span>
          </div>
        </div>
      </div>

      {/* Right Login / Sign Up Panel */}
      <div className="auth-form-panel">
        <div className="card" style={{ width: '100%', maxWidth: '430px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div className="brand-logo">RD</div>
            <div>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{isLogin ? 'Welcome Back' : 'Create Portal Account'}</h2>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                {isLogin ? 'Sign in to access your R.D. Public School portal' : 'Register as a Student, Parent, or Teacher/Admin'}
              </span>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {!isLogin && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Full Name</label>
                  <input
                    style={{ width: '100%' }}
                    type="text"
                    placeholder="e.g., Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Account Role</label>
                  <select
                    style={{ width: '100%' }}
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setAccessCode('');
                      setError('');
                    }}
                  >
                    <option value="student">Student (Open Registration)</option>
                    <option value="parent">Parent / Guardian (Requires Parent Code)</option>
                    <option value="staff">Teacher / School Admin (Requires Staff Code)</option>
                  </select>
                </div>

                {(role === 'staff' || role === 'parent') && (
                  <div style={{ background: 'var(--bg-sand)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-warm)' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                      🔑 {role === 'staff' ? 'Teacher / Admin Authorization Code' : 'Parent Verification Code'}
                    </label>
                    <input
                      style={{ width: '100%' }}
                      type="password"
                      placeholder={role === 'staff' ? 'Enter school staff passcode' : 'Enter parent passcode'}
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      required
                    />
                    <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {role === 'staff'
                        ? 'Issued exclusively to R.D. Public School faculty & administration.'
                        : 'Provided in your child’s official R.D. Public School diary.'}
                    </span>
                  </div>
                )}
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Email Address</label>
              <input
                style={{ width: '100%' }}
                type="email"
                placeholder="name@rdpublicschool.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Password</label>
              <input
                style={{ width: '100%' }}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '6px', padding: '11px' }}>
              {loading ? 'Verifying...' : isLogin ? 'Sign In to Portal' : 'Verify & Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {isLogin ? 'New to R.D. Public School portal? ' : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isLogin ? 'Create an Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
2. STUDENT / PARENT INTERFACE (3-Column Full-Density Bento Layout)
============================================================================ */
function StudentParentPortal({ user }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `👋 Namaste ${user.name}! Welcome to R.D. Public School Support. Ask me anything about admissions, school timings, fees, or campus facilities.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [myTickets, setMyTickets] = useState([]);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Academics');
  const [ticketDesc, setTicketDesc] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState('');

  const token = localStorage.getItem('school_token');

  useEffect(() => {
    fetch(`${API_URL}/api/chats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && data.messages.length > 0) setMessages(data.messages);
      })
      .catch(console.error);

    fetchTickets();
  }, []);

  const fetchTickets = () => {
    fetch(`${API_URL}/api/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) setMyTickets(data.tickets);
      })
      .catch(console.error);
  };

  const handleSendChat = async (e, presetText = null) => {
    if (e) e.preventDefault();
    const textToSend = (presetText || input).trim();
    if (!textToSend || isTyping) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.reply || data.error || 'Failed to get AI response');
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: err.message || 'Connection error. Please ensure the backend server is running.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLodgeTicket = async (e) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDesc.trim()) return;
    setSubmittingTicket(true);
    setTicketSuccess('');

    try {
      const res = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: ticketTitle,
          category: ticketCategory,
          description: ticketDesc
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTicketTitle('');
        setTicketDesc('');
        setTicketSuccess(`Logged! Tracking ID: ${data.ticket.ticketId}`);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="student-bento">
      {/* LEFT COLUMN: Campus Info, Quick Prompts & Notice Board */}
      <div className="bento-col">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80"
            alt="R.D. Public School Campus"
            style={{ width: '100%', height: '135px', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ padding: '14px 16px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '2px' }}>R.D. Public School</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Sector 14 Campus • Mon–Fri: 8:00 AM – 2:15 PM
            </p>
          </div>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '0.92rem', marginBottom: '10px' }}>⚡ Instant AI Topics</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: '📋 3-Step Admission Guide', q: 'Explain the simple 3-step admission process.' },
              { label: '💳 Monthly Fee Structure', q: 'What is the monthly fee structure for all grades?' },
              { label: '⏰ School & Office Timings', q: 'What are the school and front office timings?' },
              { label: '🚌 Bus & Campus Facilities', q: 'Tell me about school facilities and bus transport.' }
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary"
                style={{ textAlign: 'left', fontSize: '0.82rem', padding: '8px 12px' }}
                onClick={() => handleSendChat(null, item.q)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: 'var(--bg-sand)' }}>
          <h4 style={{ fontSize: '0.92rem', marginBottom: '10px' }}>📌 Campus Bulletin & Helplines</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-main)' }}>
            <li>• <strong>Admissions 2026–27:</strong> Open for Nursery to Grade 11.</li>
            <li>• <strong>Parent-Teacher Meet:</strong> Scheduled every 2nd Saturday.</li>
            <li>• <strong>Counsellor Desk:</strong> +91 98110-44210 (Confidential)</li>
            <li>• <strong>Transport Control:</strong> +91 98110-44219</li>
          </ul>
        </div>
      </div>

      {/* CENTER COLUMN: Main AI Front-Office Assistant */}
      <div className="bento-col">
        <div className="card chat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-warm)', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.08rem' }}>AI Front-Office Assistant</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Personal session for <strong>{user.name}</strong> • Chat history saved automatically
              </span>
            </div>
            <span className="badge badge-status">● AI Online</span>
          </div>

          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`message ${m.sender}`} style={{ whiteSpace: 'pre-line' }}>
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div className="message bot" style={{ fontStyle: 'italic', opacity: 0.75 }}>
                Assistant is typing...
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <input
              style={{ flex: 1 }}
              type="text"
              placeholder="Ask about admissions, fees, timings, or share a concern..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="btn btn-primary" disabled={isTyping}>
              {isTyping ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Lodge Formal Grievance & Live Status Tracker */}
      <div className="bento-col">
        <div className="card">
          <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>📝 Lodge Formal Grievance</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Directly routed to the Principal, Counsellor, or Accounts team.
          </p>

          {ticketSuccess && (
            <div style={{ background: '#DCFCE7', color: '#15803D', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px' }}>
              ✅ {ticketSuccess}
            </div>
          )}

          <form onSubmit={handleLodgeTicket} style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <input
              type="text"
              placeholder="Subject (e.g., Bus Route 4 Delay)"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              required
            />
            <select value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)}>
              <option value="Academics">Academics & Classes</option>
              <option value="Safety">Campus Safety (Urgent)</option>
              <option value="Bullying">Bullying / Student Welfare (Urgent)</option>
              <option value="Transport">School Bus / Transport</option>
              <option value="Accounts">Fees & Accounts</option>
            </select>
            <textarea
              rows="3"
              placeholder="Describe the issue clearly with student class/grade..."
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={submittingTicket}>
              {submittingTicket ? 'Submitting...' : 'Submit Grievance Ticket'}
            </button>
          </form>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>📂 My Submitted Tickets ({myTickets.length})</h4>
          {myTickets.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-sand)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
              You haven't submitted any formal grievances yet. Any ticket you file will appear here with live staff updates.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {myTickets.map((t) => (
                <div key={t.ticketId} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-warm)', background: '#FFFCF9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--primary)' }}>{t.ticketId}</strong>
                    <span className="badge badge-status">{t.status}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    Assigned to: <strong>{t.department}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
3. STAFF / ADMIN COMMAND CENTER (Exclusive to role === 'staff')
============================================================================ */
function AdminDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('school_token');

  const loadAllTickets = () => {
    fetch(`${API_URL}/api/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) {
          setTickets(data.tickets);
          if (!selectedTicket && data.tickets.length > 0) {
            setSelectedTicket(data.tickets[0]);
          } else if (selectedTicket) {
            const refreshed = data.tickets.find((t) => t.ticketId === selectedTicket.ticketId);
            if (refreshed) setSelectedTicket(refreshed);
          }
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadAllTickets();
  }, []);

  const handleUpdateTicket = async (updates) => {
    if (!selectedTicket) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/tickets/${selectedTicket.ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setNote('');
        loadAllTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      t.authorName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCount = tickets.filter((t) => t.status !== 'Resolved').length;
  const urgentCount = tickets.filter((t) => t.priority === 'Urgent' && t.status !== 'Resolved').length;
  const newCount = tickets.filter((t) => t.status === 'New').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="admin-container">
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-num">{openCount}</span>
          <span className="metric-label">Active Open Grievances</span>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #DC2626' }}>
          <span className="metric-num" style={{ color: '#DC2626' }}>{urgentCount}</span>
          <span className="metric-label">Urgent Safety / Bullying Alerts</span>
        </div>
        <div className="metric-card">
          <span className="metric-num" style={{ color: '#D97706' }}>{newCount}</span>
          <span className="metric-label">Awaiting Initial Review</span>
        </div>
        <div className="metric-card">
          <span className="metric-num" style={{ color: '#15803D' }}>{resolvedCount}</span>
          <span className="metric-label">Resolved & Closed</span>
        </div>
      </div>

      <div className="admin-split">
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '12px' }}>Grievance Queue ({filteredTickets.length})</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              style={{ flex: 1 }}
              type="text"
              placeholder="Search ID, student, or issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div style={{ maxHeight: '460px', overflowY: 'auto' }}>
            {filteredTickets.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                No grievances match your current filter.
              </p>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.ticketId}
                  className={`ticket-item ${selectedTicket?.ticketId === t.ticketId ? 'active' : ''}`}
                  onClick={() => setSelectedTicket(t)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.92rem' }}>{t.title}</strong>
                    <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <strong>{t.ticketId}</strong> • {t.authorName} • <span className="badge badge-status">{t.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          {!selectedTicket ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a ticket from the queue to inspect and take action.
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedTicket.ticketId} • {selectedTicket.category}</span>
                  <h2 style={{ fontSize: '1.3rem', marginTop: '2px' }}>{selectedTicket.title}</h2>
                </div>
                <span className={`badge badge-${selectedTicket.priority.toLowerCase()}`}>{selectedTicket.priority} Priority</span>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Submitted by <strong>{selectedTicket.authorName}</strong>
              </p>

              <div style={{ background: 'var(--bg-sand)', padding: '14px', borderRadius: '10px', marginBottom: '18px', fontSize: '0.92rem' }}>
                {selectedTicket.description}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>Update Ticket Status</label>
                  <select
                    style={{ width: '100%' }}
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateTicket({ status: e.target.value })}
                  >
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>Assign Department</label>
                  <select
                    style={{ width: '100%' }}
                    value={selectedTicket.department}
                    onChange={(e) => handleUpdateTicket({ department: e.target.value })}
                  >
                    <option value="Front Office">Front Office</option>
                    <option value="Counsellor">School Counsellor</option>
                    <option value="Principal">Principal's Office</option>
                    <option value="Accounts">Accounts & Fees</option>
                    <option value="Transport">Transport Desk</option>
                  </select>
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>Add Official Action Note</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  style={{ flex: 1 }}
                  type="text"
                  placeholder="Enter action taken or response visible in audit log..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  disabled={saving || !note.trim()}
                  onClick={() => handleUpdateTicket({ note })}
                >
                  {saving ? 'Saving...' : 'Log Action'}
                </button>
              </div>

              <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', borderTop: '1px solid var(--border-warm)', paddingTop: '14px' }}>
                Accountability & Audit Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                {selectedTicket.timeline?.map((entry, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: '#FFFCF9', border: '1px solid var(--border-warm)', borderRadius: '8px' }}>
                    <strong>{entry.author}:</strong> {entry.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
4. ROOT APPLICATION CONTROLLER
============================================================================ */
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('school_user');
    const savedToken = localStorage.getItem('school_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('school_user');
        localStorage.removeItem('school_token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('school_token');
    localStorage.removeItem('school_user');
    setUser(null);
  };

  if (!user) {
    return <AuthGateway onAuthSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div>
      <nav className="navbar">
        <div className="brand-wrap">
          <div className="brand-logo">RD</div>
          <div>
            <h2 style={{ fontSize: '1.15rem', lineHeight: 1.2 }}>R.D. Public School</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {user.role === 'staff' ? 'Administration & Grievance Command Center' : 'Student & Parent Support Portal'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{user.name}</div>
            <span className="badge badge-medium" style={{ textTransform: 'capitalize' }}>
              {user.role === 'staff' ? 'Staff Admin' : user.role}
            </span>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      {user.role === 'staff' ? (
        <AdminDashboard user={user} />
      ) : (
        <StudentParentPortal user={user} />
      )}
    </div>
  );
}